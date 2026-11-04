import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000",
  timeout: 10000,
  headers: { "Content-Type": "application/json" }
});

export const getQuestions = () => api.get("/questions");
export const getAdvisors = () => api.get("/advisors");
export const getSubmissions = () => api.get("/kq-submissions");
export const createSubmission = (data) => api.post("/kq-submissions", data);
export const replaceSubmission = (id, data) => api.put(`/kq-submissions/${id}`, data);
export const patchSubmission = (id, data) => api.patch(`/kq-submissions/${id}`, data);
export const getSelections = () => api.get("/advisor-selections");
export const saveSelection = (data) => api.post("/advisor-selections", data);
export const getMeetings = () => api.get("/meetings");
export const createMeeting = (data) => api.post("/meetings", data);
export const patchMeeting = (id, data) => api.patch(`/meetings/${id}`, data);
export const deleteMeeting = (id) => api.delete(`/meetings/${id}`);
export const getActivities = () => api.get("/activities");
export const addActivity = (data) => api.post("/activities", data);

export function getErrorMessage(error) {
  if (error?.code === "ECONNABORTED" || error?.message?.includes("timeout")) {
    return "The request timed out. Please check if JSON Server is running and responding on port 5000.";
  }
  if (error?.code === "ERR_NETWORK" || error?.message === "Network Error") {
    return "Unable to connect to the demo API. Please ensure JSON Server is running on port 5000.";
  }
  return error?.response?.data?.message || error?.message || "Something went wrong. Please try again.";
}

export default api;
