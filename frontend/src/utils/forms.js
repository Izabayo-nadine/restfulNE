/** Build empty extinguisher form from API config (no hardcoded enums). */
export function emptyExtinguisherForm(config) {
  const ex = config?.extinguisher || {};
  const types = ex.types || [];
  const sizes = ex.sizes || [];
  const statuses = ex.statuses || [];
  return {
    serialNumber: "",
    location: "",
    type: types[0] || "",
    size: sizes[0] || "",
    installationDate: "",
    expiryDate: "",
    status: statuses.includes("active") ? "active" : statuses[0] || "",
    assignedTo: "",
  };
}

export function emptyInspectionForm() {
  return { fireExtinguisher: "", inspectionDate: "", inspectionTime: "" };
}

export function emptyMaintenanceForm() {
  return {
    fireExtinguisher: "",
    actionTaken: "",
    maintenanceDate: "",
    issuesIdentified: "",
    notesAndRecommendations: "",
  };
}
