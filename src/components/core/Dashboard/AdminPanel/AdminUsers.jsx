import React, { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { fetchAdminUsers, toggleUserStatus, deleteAdminUser } from "../../../../services/operations/adminAPI";
import toast from "react-hot-toast";

const ROLES = ["", "Student", "Instructor", "Admin"];

export default function AdminUsers() {
  const { token } = useSelector((s) => s.auth);
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [role, setRole] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchAdminUsers(token, { role, page, limit: 15, search });
      setUsers(res.data);
      setTotal(res.total);
    } catch { toast.error("Failed to load users"); }
    finally { setLoading(false); }
  }, [token, role, page, search]);

  useEffect(() => { load(); }, [load]);

  const handleToggle = async (userId, currentStatus) => {
    await toggleUserStatus(token, userId, !currentStatus);
    setUsers((prev) => prev.map((u) => u._id === userId ? { ...u, active: !currentStatus } : u));
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("Delete this user?")) return;
    await deleteAdminUser(token, userId);
    setUsers((prev) => prev.filter((u) => u._id !== userId));
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search name / email…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="bg-richblack-700 text-white rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 ring-yellow-50 w-56"
        />
        <select
          value={role}
          onChange={(e) => { setRole(e.target.value); setPage(1); }}
          className="bg-richblack-700 text-white rounded-lg px-4 py-2 text-sm outline-none"
        >
          {ROLES.map((r) => <option key={r} value={r}>{r || "All Roles"}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl">
        <table className="w-full text-sm text-richblack-200">
          <thead>
            <tr className="bg-richblack-700 text-richblack-100">
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Role</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="text-center py-8 text-richblack-400">Loading…</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-8 text-richblack-400">No users found</td></tr>
            ) : users.map((u) => (
              <tr key={u._id} className="border-b border-richblack-700 hover:bg-richblack-700/40 transition">
                <td className="px-4 py-3 flex items-center gap-2">
                  <img src={u.image} alt="" className="w-7 h-7 rounded-full object-cover" />
                  {u.firstName} {u.lastName}
                </td>
                <td className="px-4 py-3">{u.email}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    u.accountType === "Admin" ? "bg-purple-900 text-purple-200"
                    : u.accountType === "Instructor" ? "bg-blue-900 text-blue-200"
                    : "bg-green-900 text-green-200"
                  }`}>{u.accountType}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${u.active ? "bg-green-900 text-green-200" : "bg-red-900 text-red-200"}`}>
                    {u.active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-4 py-3 flex gap-2">
                  <button
                    onClick={() => handleToggle(u._id, u.active)}
                    className="text-xs px-2 py-1 rounded bg-richblack-600 hover:bg-richblack-500 transition"
                  >
                    {u.active ? "Deactivate" : "Activate"}
                  </button>
                  <button
                    onClick={() => handleDelete(u._id)}
                    className="text-xs px-2 py-1 rounded bg-red-900 hover:bg-red-700 text-red-200 transition"
                  >
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
        <span>{total} total users</span>
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
