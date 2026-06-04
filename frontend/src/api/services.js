import client from "./client";

export const configApi = {
  get: () => client.get("/config"),
};

/** Fetch all records across paginated list endpoints. */
export async function fetchAllPages(listFn, { limit, ...params } = {}) {
  if (!limit) throw new Error("fetchAllPages requires limit from app config");
  let page = 1;
  const all = [];
  let totalPages = 1;
  do {
    const res = await listFn({ ...params, page, limit });
    const chunk = res.data.data || [];
    all.push(...chunk);
    totalPages = res.data.pagination?.totalPages ?? 1;
    page += 1;
  } while (page <= totalPages);
  return all;
}

export const authApi = {
  registerSendOtp: (data) => client.post("/auth/register/send-otp", data),
  registerVerifyOtp: (email, otp) =>
    client.post("/auth/register/verify-otp", {
      email: email.trim().toLowerCase(),
      otp: String(otp).trim(),
    }),
  login: (data) => client.post("/auth/login", data),
  logout: () => client.post("/auth/logout"),
  profile: () => client.get("/auth/profile"),
  updateProfile: (data) => client.patch("/auth/profile", data),
  changePassword: (data) => client.patch("/auth/change-password", data),
  forgotPasswordSendOtp: (email) =>
    client.post("/auth/forgot-password/send-otp", { email }),
  forgotPasswordReset: (data) =>
    client.post("/auth/forgot-password/reset", data),
  listUsers: (params) => client.get("/auth/users", { params }),
  createInspector: (data) => client.post("/auth/users", data),
  updateUser: (id, data) => client.patch(`/auth/users/${id}`, data),
  deleteUser: (id) => client.delete(`/auth/users/${id}`),
};

export const extinguisherApi = {
  list: (params) => client.get("/extinguishers", { params }),
  get: (id) => client.get(`/extinguishers/${id}`),
  create: (data) => client.post("/extinguishers", data),
  update: (id, data) => client.patch(`/extinguishers/${id}`, data),
  remove: (id) => client.delete(`/extinguishers/${id}`),
};

export const inspectionApi = {
  list: (params) => client.get("/inspections", { params }),
  get: (id) => client.get(`/inspections/${id}`),
  schedule: (data) => client.post("/inspections", data),
  complete: (id, data) => client.patch(`/inspections/${id}/complete`, data),
};

export const maintenanceApi = {
  list: (params) => client.get("/maintenance", { params }),
  log: (data) => client.post("/maintenance", data),
};

export const reportApi = {
  /** Role-scoped KPIs and summary lists from MongoDB (all dashboards). */
  dashboard: () => client.get("/reports/dashboard"),
  inventory: (period) =>
    client.get("/reports/inventory", { params: { period } }),
  inspections: () => client.get("/reports/inspections"),
  compliance: () => client.get("/reports/compliance"),
  maintenance: (params) => client.get("/reports/maintenance", { params }),
  exportUrl: (type, format) => {
    const base = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";
    const token = localStorage.getItem("fems_token");
    return `${base}/reports/export?type=${type}&format=${format}&token=${token}`;
  },
  export: async (type, format) => {
    const res = await client.get("/reports/export", {
      params: { type, format },
      responseType: "blob",
    });
    return res;
  },
};

export const notificationApi = {
  list: (params) => client.get("/notifications", { params }),
  unreadCount: () => client.get("/notifications/unread-count"),
  markRead: (id) => client.patch(`/notifications/${id}/read`),
  markAllRead: () => client.patch("/notifications/read-all"),
};
