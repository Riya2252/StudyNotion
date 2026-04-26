import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { fetchPlatformStats } from "../../../../services/operations/adminAPI";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function AdminStats() {
  const { token } = useSelector((s) => s.auth);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlatformStats(token)
      .then((d) => setStats(d.data))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <div className="text-center text-richblack-300 py-10">Loading stats…</div>;
  if (!stats) return null;

  const growthData = stats.userGrowth.map((g) => ({
    month: MONTH_NAMES[g._id.month - 1],
    users: g.count,
  }));

  const statCards = [
    { label: "Total Users", value: stats.totalUsers },
    { label: "Students", value: stats.totalStudents },
    { label: "Instructors", value: stats.totalInstructors },
    { label: "Published Courses", value: stats.publishedCourses },
    { label: "Total Courses", value: stats.totalCourses },
  ];

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {statCards.map((s) => (
          <div key={s.label} className="bg-richblack-700 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-yellow-50">{s.value}</p>
            <p className="text-richblack-300 text-sm mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <div className="bg-richblack-700 rounded-xl p-5">
          <h3 className="text-white font-semibold mb-4">User Growth (Last 6 Months)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={growthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2C333F" />
              <XAxis dataKey="month" stroke="#AFB2BF" fontSize={12} />
              <YAxis stroke="#AFB2BF" fontSize={12} />
              <Tooltip contentStyle={{ background: "#2C333F", border: "none", color: "#fff" }} />
              <Bar dataKey="users" fill="#FFD60A" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Courses */}
        <div className="bg-richblack-700 rounded-xl p-5">
          <h3 className="text-white font-semibold mb-4">Top Courses by Enrollment</h3>
          <ul className="space-y-3">
            {stats.topCourses.map((c, i) => (
              <li key={i} className="flex justify-between items-center">
                <span className="text-richblack-200 text-sm truncate max-w-[65%]">{c.name}</span>
                <span className="text-yellow-50 font-semibold text-sm">{c.students} students</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
