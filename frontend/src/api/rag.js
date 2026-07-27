import { api } from "./client.js";

export const ragApi = {
  list: () => api.get("/rag").then((r) => r.data),
  addText: (source, content) => api.post("/rag/text", { source, content }).then((r) => r.data),
  remove: (source) => api.delete(`/rag/${encodeURIComponent(source)}`).then((r) => r.data),
  upload: (file) => {
    const form = new FormData();
    form.append("file", file);
    return api
      .post("/rag/upload", form, { headers: { "Content-Type": "multipart/form-data" } })
      .then((r) => r.data);
  },
};
