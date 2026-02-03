import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ProcessStep } from '@/components/ProcessStep';
import { FeatureItem } from '@/components/FeatureItem';
import { Button } from '@/components/ui/button';

const Index = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 lg:py-28">
          <div className="container text-center">
            <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              AuthDoc
            </h1>
            <p className="mb-2 text-xl font-medium text-primary sm:text-2xl">
              Verification-first document intelligence
            </p>
            <p className="mx-auto mb-12 max-w-2xl text-muted-foreground">
              AuthDoc extracts and verifies academic documents using configurable rules.
            </p>

            {/* Process Steps */}
            <div className="mx-auto mb-12 grid max-w-4xl gap-6 sm:grid-cols-3">
              <ProcessStep
                step={1}
                title="Upload"
                description="Upload your academic document in PDF or image format"
              />
              <ProcessStep
                step={2}
                title="Extract"
                description="AI extracts data fields from your document"
              />
              <ProcessStep
                step={3}
                title="Verify"
                description="Rules-based verification ensures data quality"
              />
            </div>

            {/* CTA Button */}
            <Link to="/upload">
              <Button size="lg" className="px-8 py-6 text-lg font-semibold">
                Upload Academic Document
              </Button>
            </Link>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-secondary/30 py-16">
          <div className="container">
            <div className="mx-auto max-w-4xl rounded-xl border border-border bg-card p-8 lg:p-10">
              <h2 className="mb-8 text-2xl font-bold text-foreground">
                Why AuthDoc?
              </h2>
              <div className="grid gap-6 sm:grid-cols-2">
                <FeatureItem
                  title="Verification-First Approach"
                  description="Prioritizes data accuracy and consistency over raw extraction"
                />
                <FeatureItem
                  title="Configurable Rules"
                  description="Organizations define verification rules that matter to them"
                />
                <FeatureItem
                  title="Full Explainability"
                  description="See exactly why data is verified or flagged"
                />
                <FeatureItem
                  title="Clean & Simple UI"
                  description="Understand the product in less than 15 seconds"
                />
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
