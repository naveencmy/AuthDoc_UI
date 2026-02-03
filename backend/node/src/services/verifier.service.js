/**
 * Generic rule-based verification engine
 */
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
      if (v == null || Number.isNaN(v))
        set(rule.field, "MISSING", "Value missing");
      else if (v < rule.min || v > rule.max)
        set(rule.field, "FLAGGED", "Out of allowed range");
      else set(rule.field, "VERIFIED", "Within allowed range");
    }

    if (rule.type === "delta") {
      const a = data[rule.field];
      const b = data[rule.compare_with];
      if (a == null || b == null)
        set(rule.field, "MISSING", "Comparison data missing");
      else if (Math.abs(a - b) > rule.max_diff)
        set(rule.field, "FLAGGED", "Deviation exceeds threshold");
      else set(rule.field, "VERIFIED", "Difference acceptable");
    }

    if (rule.type === "dependency") {
      const grades = data[rule.depends_on] || [];
      const hasFail = grades.some(g => g.grade !== "PASS");
      if (hasFail && data[rule.field] === "PASS")
        set(rule.field, "FLAGGED", "Result conflicts with failed subject");
      else set(rule.field, "VERIFIED", "Dependency satisfied");
    }
  }

  return results;
};
