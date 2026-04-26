import React, { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { fetchAdminCourses, approveCourse, rejectCourse, deleteAdminCourse } from "../../../../services/operations/adminAPI";
import toast from "react-hot-toast";

const STATUS_OPTIONS = ["", "Draft", "Published"];

export default function AdminCourses() {
  const { token } = useSelector((s) => s.auth);
  const [courses, setCourses] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchAdminCourses(token, { status, page, limit: 15 });
      setCourses(res.data);
      setTotal(res.total);
    } catch { toast.error("Failed to load courses"); }
    finally { setLoading(false); }
  }, [token, status, page]);

  useEffect(() => { load(); }, [load]);

  const handleApprove = async (courseId) => {
    await approveCourse(token, courseId);
    setCourses((prev) => prev.map((c) => c._id === courseId ? { ...c, status: "Published" } : c));
  };

  const handleReject = async (courseId) => {
    await rejectCourse(token, courseId);
    setCourses((prev) => prev.map((c) => c._id === courseId ? { ...c, status: "Draft" } : c));
  };

  const handleDelete = async (courseId) => {
    if (!window.confirm("Delete this course?")) return;
    await deleteAdminCourse(token, courseId);
    setCourses((prev) => prev.filter((c) => c._id !== courseId));
  };

  return (
    <div className="space-y-4">
      {/* Filter */}
      <select
        value={status}
        onChange={(e) => { setStatus(e.target.value); setPage(1); }}
        className="bg-richblack-700 text-white rounded-lg px-4 py-2 text-sm outline-none"
      >
        {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s || "All Status"}</option>)}
      </select>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl">
        <table className="w-full text-sm text-richblack-200">
          <thead>
            <tr className="bg-richblack-700 text-richblack-100">
              <th className="px-4 py-3 text-left">Course</th>
              <th className="px-4 py-3 text-left">Instructor</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Students</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="text-center py-8 text-richblack-400">Loading…</td></tr>
            ) : courses.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-8 text-richblack-400">No courses found</td></tr>
            ) : courses.map((c) => (
              <tr key={c._id} className="border-b border-richblack-700 hover:bg-richblack-700/40 transition">
                <td className="px-4 py-3 max-w-[200px] truncate">{c.courseName}</td>
                <td className="px-4 py-3">{c.instructor?.firstName} {c.instructor?.lastName}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    c.status === "Published" ? "bg-green-900 text-green-200" : "bg-yellow-900 text-yellow-200"
                  }`}>{c.status}</span>
                </td>
                <td className="px-4 py-3">{c.studentsEnrolled?.length || 0}</td>
                <td className="px-4 py-3 flex flex-wrap gap-2">
                  {c.status !== "Published" && (
                    <button onClick={() => handleApprove(c._id)}
                      className="text-xs px-2 py-1 rounded bg-green-900 hover:bg-green-700 text-green-200 transition">
                      Approve
                    </button>
                  )}
                  {c.status === "Published" && (
                    <button onClick={() => handleReject(c._id)}
                      className="text-xs px-2 py-1 rounded bg-yellow-900 hover:bg-yellow-700 text-yellow-200 transition">
                      Unpublish
                    </button>
                  )}
                  <button onClick={() => handleDelete(c._id)}
                    className="text-xs px-2 py-1 rounded bg-red-900 hover:bg-red-700 text-red-200 transition">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-richblack-300 text-sm">
        <span>{total} total courses</span>
        <div className="flex gap-2">
          <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1 rounded bg-richblack-700 disabled:opacity-40">Prev</button>
          <span className="px-3 py-1">{page}</span>
          <button disabled={page * 15 >= total} onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1 rounded bg-richblack-700 disabled:opacity-40">Next</button>
        </div>
      </div>
    </div>
  );
}
