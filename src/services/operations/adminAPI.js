import { apiConnector } from "../apiconnector";
import toast from "react-hot-toast";

const BASE = process.env.REACT_APP_BASE_URL || "http://localhost:4000/api/v1";

export const ADMIN_API = {
  USERS: `${BASE}/admin/users`,
  USER_STATUS: (id) => `${BASE}/admin/users/${id}/status`,
  DELETE_USER: (id) => `${BASE}/admin/users/${id}`,
  COURSES: `${BASE}/admin/courses`,
  APPROVE_COURSE: (id) => `${BASE}/admin/courses/${id}/approve`,
  REJECT_COURSE: (id) => `${BASE}/admin/courses/${id}/reject`,
  DELETE_COURSE: (id) => `${BASE}/admin/courses/${id}`,
  STATS: `${BASE}/admin/stats`,
};

const headers = (token) => ({ Authorization: `Bearer ${token}` });

export const fetchPlatformStats = async (token) => {
  const res = await apiConnector("GET", ADMIN_API.STATS, null, headers(token));
  return res.data;
};

export const fetchAdminUsers = async (token, params = {}) => {
  const query = new URLSearchParams(params).toString();
  const res = await apiConnector("GET", `${ADMIN_API.USERS}?${query}`, null, headers(token));
  return res.data;
};

export const toggleUserStatus = async (token, userId, active) => {
  const res = await apiConnector("PATCH", ADMIN_API.USER_STATUS(userId), { active }, headers(token));
  return res.data;
};

export const deleteAdminUser = async (token, userId) => {
  const res = await apiConnector("DELETE", ADMIN_API.DELETE_USER(userId), null, headers(token));
  toast.success("User deleted");
  return res.data;
};

export const fetchAdminCourses = async (token, params = {}) => {
  const query = new URLSearchParams(params).toString();
  const res = await apiConnector("GET", `${ADMIN_API.COURSES}?${query}`, null, headers(token));
  return res.data;
};

export const approveCourse = async (token, courseId) => {
  const res = await apiConnector("PATCH", ADMIN_API.APPROVE_COURSE(courseId), null, headers(token));
  toast.success("Course approved");
  return res.data;
};

export const rejectCourse = async (token, courseId) => {
  const res = await apiConnector("PATCH", ADMIN_API.REJECT_COURSE(courseId), null, headers(token));
  toast.success("Course rejected");
  return res.data;
};

export const deleteAdminCourse = async (token, courseId) => {
  const res = await apiConnector("DELETE", ADMIN_API.DELETE_COURSE(courseId), null, headers(token));
  toast.success("Course deleted");
  return res.data;
};
