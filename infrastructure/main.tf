# ============================================================
#  AuthDoc — Terraform IaC (GCP Cloud Run)
#  Provisions: Artifact Registry · Cloud Run (x3) · IAM
# ============================================================

terraform {
  required_version = ">= 1.5.0"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

# ============================================================
# Variables
# ============================================================

variable "project_id" {
  description = "GCP project ID"
  type        = string
}

variable "region" {
  description = "GCP region"
  type        = string
  default     = "us-central1"
}

variable "repo_name" {
  description = "Artifact Registry repository name"
  type        = string
  default     = "authdoc-repo"
}

variable "gemini_secret_id" {
  description = "Secret Manager secret ID for Gemini API key"
  type        = string
  default     = "gemini-api-key"
}

# ============================================================
# Enable required APIs
# ============================================================

resource "google_project_service" "services" {
  for_each = toset([
    "run.googleapis.com",
    "artifactregistry.googleapis.com",
    "secretmanager.googleapis.com",
    "cloudbuild.googleapis.com",
  ])

  service            = each.value
  disable_on_destroy = false
}

# ============================================================
# Artifact Registry
# ============================================================

resource "google_artifact_registry_repository" "authdoc" {
  location      = var.region
  repository_id = var.repo_name
  description   = "AuthDoc container images"
  format        = "DOCKER"

  depends_on = [google_project_service.services]
}

# ============================================================
# Service Accounts (least privilege)
# ============================================================

resource "google_service_account" "api" {
  account_id   = "authdoc-api-sa"
  display_name = "AuthDoc API Service Account"
}

resource "google_service_account" "ocr" {
  account_id   = "authdoc-ocr-sa"
  display_name = "AuthDoc OCR Service Account"
}

resource "google_service_account" "frontend" {
  account_id   = "authdoc-frontend-sa"
  display_name = "AuthDoc Frontend Service Account"
}

# ============================================================
# Secret Manager (Gemini API key)
# ============================================================

resource "google_secret_manager_secret" "gemini_key" {
  secret_id = var.gemini_secret_id

  replication {
    auto {}
  }

  depends_on = [google_project_service.services]
}

# Grant API SA access to the secret
resource "google_secret_manager_secret_iam_binding" "gemini_access" {
  secret_id = google_secret_manager_secret.gemini_key.id
  role      = "roles/secretmanager.secretAccessor"
  members   = ["serviceAccount:${google_service_account.api.email}"]
}

# ============================================================
# Cloud Run — Python OCR Service
# ============================================================

resource "google_cloud_run_v2_service" "ocr" {
  name     = "authdoc-ocr"
  location = var.region

  template {
    service_account = google_service_account.ocr.email

    containers {
      image = "${var.region}-docker.pkg.dev/${var.project_id}/${var.repo_name}/authdoc-ocr:latest"

      ports {
        container_port = 8000
      }

      env {
        name  = "PORT"
        value = "8000"
      }

      env {
        name  = "LOG_LEVEL"
        value = "INFO"
      }

      resources {
        limits = {
          cpu    = "1"
          memory = "512Mi"
        }
      }

      startup_probe {
        http_get {
          path = "/healthz"
          port = 8000
        }
        initial_delay_seconds = 10
        period_seconds        = 30
        failure_threshold     = 3
      }
    }

    scaling {
      min_instance_count = 0
      max_instance_count = 5
    }
  }

  depends_on = [google_project_service.services]
}

# Allow unauthenticated access to OCR (internal service)
resource "google_cloud_run_v2_service_iam_binding" "ocr_invoker" {
  project  = var.project_id
  location = var.region
  name     = google_cloud_run_v2_service.ocr.name
  role     = "roles/run.invoker"
  members  = ["allUsers"]
}

# ============================================================
# Cloud Run — Node.js API
# ============================================================

resource "google_cloud_run_v2_service" "api" {
  name     = "authdoc-api"
  location = var.region

  template {
    service_account = google_service_account.api.email

    containers {
      image = "${var.region}-docker.pkg.dev/${var.project_id}/${var.repo_name}/authdoc-api:latest"

      ports {
        container_port = 3000
      }

      env {
        name  = "NODE_ENV"
        value = "production"
      }

      env {
        name  = "PORT"
        value = "3000"
      }

      env {
        name  = "PYTHON_OCR_URL"
        value = "http://${google_cloud_run_v2_service.ocr.uri}/extract"
      }

      env {
        name  = "GEMINI_MODEL"
        value = "gemini-1.5-flash"
      }

      env {
        name  = "CORS_ORIGINS"
        value = "https://${google_cloud_run_v2_service.frontend.uri}"
      }

      # Inject Gemini API key from Secret Manager
      env {
        name = "GEMINI_API_KEY"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.gemini_key.secret_id
            version = "latest"
          }
        }
      }

      resources {
        limits = {
          cpu    = "1"
          memory = "512Mi"
        }
      }

      startup_probe {
        http_get {
          path = "/healthz"
          port = 3000
        }
        initial_delay_seconds = 10
        period_seconds        = 30
        failure_threshold     = 3
      }
    }

    scaling {
      min_instance_count = 0
      max_instance_count = 5
    }
  }

  depends_on = [
    google_project_service.services,
    google_cloud_run_v2_service.ocr,
    google_secret_manager_secret_iam_binding.gemini_access,
  ]
}

# ============================================================
# Cloud Run — Frontend (Nginx)
# ============================================================

resource "google_cloud_run_v2_service" "frontend" {
  name     = "authdoc-frontend"
  location = var.region

  template {
    service_account = google_service_account.frontend.email

    containers {
      image = "${var.region}-docker.pkg.dev/${var.project_id}/${var.repo_name}/authdoc-frontend:latest"

      ports {
        container_port = 80
      }

      resources {
        limits = {
          cpu    = "1"
          memory = "256Mi"
        }
      }
    }

    scaling {
      min_instance_count = 0
      max_instance_count = 3
    }
  }

  depends_on = [google_project_service.services]
}

# Allow public access to frontend
resource "google_cloud_run_v2_service_iam_binding" "frontend_invoker" {
  project  = var.project_id
  location = var.region
  name     = google_cloud_run_v2_service.frontend.name
  role     = "roles/run.invoker"
  members  = ["allUsers"]
}

# ============================================================
# Outputs
# ============================================================

output "ocr_service_url" {
  description = "OCR service URL"
  value       = google_cloud_run_v2_service.ocr.uri
}

output "api_service_url" {
  description = "API service URL"
  value       = google_cloud_run_v2_service.api.uri
}

output "frontend_service_url" {
  description = "Frontend service URL"
  value       = google_cloud_run_v2_service.frontend.uri
}

output "artifact_registry_url" {
  description = "Artifact Registry repository URL"
  value       = "${var.region}-docker.pkg.dev/${var.project_id}/${var.repo_name}"
}
