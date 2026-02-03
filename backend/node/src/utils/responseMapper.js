const mapSingleVerification = (documentId, results) => {
  const pick = (field) => ({
    value: results[field]?.value ?? null,
    status: results[field]?.status ?? "MISSING",
    reason: results[field]?.reason ?? "Not evaluated"
  });

  return {
    document_id: documentId,
    results: {
      gpa: pick("gpa"),
      cgpa: pick("cgpa"),
      result_status: pick("result_status")
    }
  };
};

module.exports = {
  mapSingleVerification
};
