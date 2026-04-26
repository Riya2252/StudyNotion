import { apiConnector } from "../apiconnector";

const BASE = process.env.REACT_APP_BASE_URL || "http://localhost:4000/api/v1";
const headers = (token) => ({ Authorization: `Bearer ${token}` });

export const getStudentAnalytics = async (token) => {
  const res = await apiConnector("GET", `${BASE}/analytics/student`, null, headers(token));
  return res.data;
};

export const getInstructorAnalytics = async (token) => {
  const res = await apiConnector("GET", `${BASE}/analytics/instructor`, null, headers(token));
  return res.data;
};
