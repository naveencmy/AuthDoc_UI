const axios = require("axios");

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-1.5-flash";
const TIMEOUT_MS = 5000;

const GEMINI_URL =
  `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

/**
 * Build structured AI prompt
 */
function buildPrompt(verification) {
  return `
You are an academic risk analysis engine.

Analyze the following structured verification result.

Respond STRICTLY in JSON format:

{
  "risk_level": "Low | Medium | High",
  "summary": "Short explanation",
  "key_issues": "Comma separated list",
  "recommended_action": "Actionable recommendation"
}

Verification Result:
${JSON.stringify(verification, null, 2)}
`;
}

/**
 * Safe fallback if AI fails
 */
function fallbackAudit(verification) {
  if (verification.overall_status === "VERIFIED") {
    return {
      risk_level: "Low",
      summary: "Document verified successfully with no discrepancies.",
      key_issues: "None",
      recommended_action: "No action required."
    };
  }

  if (verification.arrears?.length) {
    return {
      risk_level: "High",
      summary: "Arrear subjects detected.",
      key_issues: verification.arrears.join(", "),
      recommended_action: "Student must clear arrears."
    };
  }

  return {
    risk_level: "Medium",
    summary: "Discrepancies detected during verification.",
    key_issues: "Subject mismatches or database inconsistencies",
    recommended_action: "Manual audit recommended."
  };
}

/**
 * Extract JSON safely from Gemini output
 */
function safeJsonParse(text) {
  try {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start === -1 || end === -1) return null;
    return JSON.parse(text.slice(start, end + 1));
  } catch {
    return null;
  }
}

/**
 * Main AI Audit function
 */
async function generateAudit(verification) {
  if (!GEMINI_API_KEY) {
    return fallbackAudit(verification);
  }

  try {
    const response = await axios.post(
      GEMINI_URL,
      {
        contents: [
          {
            parts: [{ text: buildPrompt(verification) }]
          }
        ]
      },
      { timeout: TIMEOUT_MS }
    );

    const text =
      response?.data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    const parsed = safeJsonParse(text);

    if (!parsed) {
      return fallbackAudit(verification);
    }

    return {
      risk_level: parsed.risk_level || "Medium",
      summary: parsed.summary || "AI summary unavailable.",
      key_issues: parsed.key_issues || "N/A",
      recommended_action:
        parsed.recommended_action || "Manual review recommended."
    };

  } catch {
    return fallbackAudit(verification);
  }
}

module.exports = { generateAudit };