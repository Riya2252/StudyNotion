import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { getInstructorAnalytics } from "../../../../services/operations/analyticsAPI";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const COLORS = ["#FFD60A", "#00C6FB", "#FF6B6B", "#6BCB77", "#845EC2", "#FFC75F"];

export default function InstructorAnalytics() {
  const { token } = useSelector((s) => s.auth);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getInstructorAnalytics(token)
      .then((res) => setAnalytics(res.data))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <div className="text-center text-richblack-300 py-10">Loading analytics…</div>;
  if (!analytics?.courses?.length)
    return <p className="text-richblack-300 text-center py-10">No courses created yet.</p>;

  const { courses, enrollmentTrend } = analytics;

  const totalStudents = courses.reduce((s, c) => s + c.totalStudents, 0);
  const totalRevenue = courses.reduce((s, c) => s + c.revenue, 0);
  const avgRating = courses.length
    ? (courses.reduce((s, c) => s + c.avgRating, 0) / courses.length).toFixed(1)
    : 0;

  const trendData = enrollmentTrend.map((t) => ({
    month: MONTH_NAMES[t._id.month - 1],
    enrollments: t.count,
  }));

  const pieData = courses.map((c) => ({
    name: c.courseName.length > 20 ? c.courseName.slice(0, 20) + "…" : c.courseName,
    value: c.totalStudents,
  }));

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Courses", value: courses.length },
          { label: "Total Students", value: totalStudents },
          { label: "Total Revenue", value: `₹${totalRevenue.toLocaleString("en-IN")}` },
          { label: "Avg Rating", value: avgRating },
        ].map((s) => (
          <div key={s.label} className="bg-richblack-700 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-yellow-50">{s.value}</p>
            <p className="text-richblack-300 text-sm mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Enrollment trend */}
        {trendData.length > 0 && (
          <div className="bg-richblack-700 rounded-xl p-5">
            <h3 className="text-white font-semibold mb-4">Enrollment Trend</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2C333F" />
                <XAxis dataKey="month" stroke="#AFB2BF" fontSize={12} />
                <YAxis stroke="#AFB2BF" fontSize={12} />
                <Tooltip contentStyle={{ background: "#2C333F", border: "none", color: "#fff" }} />
                <Line type="monotone" dataKey="enrollments" stroke="#FFD60A" strokeWidth={2} dot={{ fill: "#FFD60A" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Student distribution pie */}
        <div className="bg-richblack-700 rounded-xl p-5">
          <h3 className="text-white font-semibold mb-4">Students per Course</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "#2C333F", border: "none", color: "#fff" }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Per-course table */}
      <div className="bg-richblack-700 rounded-xl overflow-hidden">
        <table className="w-full text-sm text-richblack-200">
          <thead>
            <tr className="bg-richblack-600 text-richblack-100">
              <th className="px-4 py-3 text-left">Course</th>
              <th className="px-4 py-3 text-right">Students</th>
              <th className="px-4 py-3 text-right">Rating</th>
              <th className="px-4 py-3 text-right">Revenue</th>
              <th className="px-4 py-3 text-right">Avg Videos Done</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((c) => (
              <tr key={c.courseId} className="border-b border-richblack-600 hover:bg-richblack-600/40 transition">
                <td className="px-4 py-3 max-w-[200px] truncate">{c.courseName}</td>
                <td className="px-4 py-3 text-right">{c.totalStudents}</td>
                <td className="px-4 py-3 text-right">{c.avgRating} ⭐</td>
                <td className="px-4 py-3 text-right">₹{c.revenue.toLocaleString("en-IN")}</td>
                <td className="px-4 py-3 text-right">{c.avgVideosCompleted}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
