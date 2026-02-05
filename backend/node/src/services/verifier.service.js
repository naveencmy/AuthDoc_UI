const db = require("../config/policies.json");

exports.verify = (data) => {
  const { umis_no, subject_grades } = data;

  if (!umis_no) {
    return {
      overall_status: "MISSING",
      reason: "UMIS number not detected from document"
    };
  }

  const record = db[umis_no];

  if (!record) {
    return {
      overall_status: "FLAGGED",
      reason: "UMIS number not found in institutional database"
    };
  }

  const mismatches = [];

  for (const sub of subject_grades) {
    const expected = record.subjects[sub.code];

    if (!expected) {
      mismatches.push({
        subject: sub.code,
        issue: "Subject not present in DB"
      });
    } else if (expected !== sub.grade) {
      mismatches.push({
        subject: sub.code,
        expected,
        found: sub.grade
      });
    }
  }

  if (mismatches.length > 0) {
    return {
      overall_status: "FLAGGED",
      mismatches
    };
  }

  return {
    overall_status: "VERIFIED",
    reason: "All subjects match institutional records"
  };
};
