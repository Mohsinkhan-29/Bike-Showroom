import { api } from "./client.js";

export const bikesApi = {
  list: (params) => api.get("/bikes", { params }).then((r) => r.data),
  get: (id) => api.get(`/bikes/${id}`).then((r) => r.data),
  create: (data) => api.post("/bikes", data).then((r) => r.data),
  update: (id, data) => api.put(`/bikes/${id}`, data).then((r) => r.data),
  remove: (id) => api.delete(`/bikes/${id}`).then((r) => r.data),
  updateStock: (id, stock) => api.patch(`/bikes/${id}/stock`, { stock }).then((r) => r.data),
  // Uploads an image file and returns { image_url } — a data URL ready to
  // drop straight into the bike's image_url field.
  uploadImage: (file) => {
    const form = new FormData();
    form.append("image", file);
    return api
      .post("/bikes/upload-image", form, { headers: { "Content-Type": "multipart/form-data" } })
      .then((r) => r.data);
  },
};

export const leadsApi = {
  create: (data) => api.post("/leads", data).then((r) => r.data),
  list: () => api.get("/leads").then((r) => r.data),
};

export const recommendApi = {
  submit: (data) => api.post("/recommend", data).then((r) => r.data),
};

export const dashboardApi = {
  kpis: () => api.get("/dashboard/kpis").then((r) => r.data),
};

export const chatApi = {
  // history: [{ role: 'user' | 'assistant', text }, ...]
  send: (message, history = []) => api.post("/chat", { message, history }).then((r) => r.data),
};
