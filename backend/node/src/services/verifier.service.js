exports.verify = (data, policy) => {
  const results = {};

  const set = (field, status, reason) => {
    if (results[field]?.status === "MISSING" && status === "VERIFIED") return;

    results[field] = {
      value: data[field] ?? null,
      status,
      reason
    };
  };

  for (const rule of policy.rules) {

    if (rule.type === "range") {
      const v = data[rule.field];

      if (v === "WITHHELD") {
        set(rule.field, "MISSING", "Value withheld by institution");
      } else if (v == null || Number.isNaN(v)) {
        set(rule.field, "MISSING", "Value missing");
      } else if (v < rule.min || v > rule.max) {
        set(rule.field, "FLAGGED", "Out of allowed range");
      } else {
        set(rule.field, "VERIFIED", "Within allowed range");
      }
    }

    if (rule.type === "delta") {
      const a = data[rule.field];
      const b = data[rule.compare_with];

      if (a === "WITHHELD") {
        set(rule.field, "MISSING", "CGPA withheld due to arrears");
      } else if (a == null || b == null) {
        set(rule.field, "MISSING", "Comparison data missing");
      } else if (Math.abs(a - b) > rule.max_diff) {
        set(rule.field, "FLAGGED", "Deviation exceeds threshold");
      } else {
        set(rule.field, "VERIFIED", "Difference acceptable");
      }
    }
    if (rule.type === "dependency") {
      const grades = data[rule.depends_on] || [];

      const hasFail = grades.some(g =>
        ["U", "AB", "WD", "RA", "FAIL"].includes(g.grade)
      );

      if (hasFail) {
        set(rule.field, "FLAGGED", "Arrear subjects detected");
      } else {
        set(rule.field, "VERIFIED", "All subjects cleared");
      }
    }
  }
  return results;
};
