import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { getStudentAnalytics } from "../../../../services/operations/analyticsAPI";
import {
  RadialBarChart, RadialBar, Legend, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";
import { Link } from "react-router-dom";

export default function StudentAnalytics() {
  const { token } = useSelector((s) => s.auth);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStudentAnalytics(token)
      .then((res) => setData(res.data || []))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <div className="text-center text-richblack-300 py-10">Loading analytics…</div>;
  if (data.length === 0)
    return <p className="text-richblack-300 text-center py-10">No enrolled courses yet. <Link to="/catalog" className="text-yellow-50 underline">Browse courses</Link></p>;

  const chartData = data.map((c) => ({
    name: c.courseName.length > 20 ? c.courseName.slice(0, 20) + "…" : c.courseName,
    completion: c.completionPercentage,
  }));

  const completedCourses = data.filter((c) => c.completionPercentage === 100).length;
  const inProgressCourses = data.filter((c) => c.completionPercentage > 0 && c.completionPercentage < 100).length;

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Enrolled", value: data.length },
          { label: "Completed", value: completedCourses },
          { label: "In Progress", value: inProgressCourses },
        ].map((s) => (
          <div key={s.label} className="bg-richblack-700 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-yellow-50">{s.value}</p>
            <p className="text-richblack-300 text-sm mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Progress bar chart */}
      <div className="bg-richblack-700 rounded-xl p-5">
        <h3 className="text-white font-semibold mb-4">Course Completion %</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#2C333F" />
            <XAxis type="number" domain={[0, 100]} stroke="#AFB2BF" fontSize={12} unit="%" />
            <YAxis type="category" dataKey="name" stroke="#AFB2BF" fontSize={11} width={140} />
            <Tooltip
              formatter={(v) => [`${v}%`, "Completion"]}
              contentStyle={{ background: "#2C333F", border: "none", color: "#fff" }}
            />
            <Bar dataKey="completion" fill="#FFD60A" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Per-course details */}
      <div className="space-y-3">
        {data.map((course) => (
          <div key={course.courseId} className="bg-richblack-700 rounded-xl p-4 flex items-center gap-4">
            <img src={course.thumbnail} alt="" className="w-14 h-10 rounded object-cover" />
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium truncate">{course.courseName}</p>
              <p className="text-richblack-400 text-xs mt-0.5">
                {course.completedVideos}/{course.totalVideos} videos completed
              </p>
              <div className="mt-2 h-2 bg-richblack-600 rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-50 rounded-full transition-all duration-500"
                  style={{ width: `${course.completionPercentage}%` }}
                />
              </div>
            </div>
            <span className="text-yellow-50 font-bold text-sm whitespace-nowrap">
              {course.completionPercentage}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
