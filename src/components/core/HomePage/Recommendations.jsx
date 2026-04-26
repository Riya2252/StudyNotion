import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { apiConnector } from "../../../services/apiconnector";
import RatingStars from "../../common/RatingStars";

const BASE = process.env.REACT_APP_BASE_URL || "http://localhost:4000/api/v1";

export default function Recommendations() {
  const { token } = useSelector((s) => s.auth);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const url = token ? `${BASE}/recommendations` : `${BASE}/recommendations/top`;
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    apiConnector("GET", url, null, headers)
      .then((res) => setCourses(res.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  if (loading || courses.length === 0) return null;

  return (
    <section className="w-full py-12 px-4">
      <div className="max-w-maxContent mx-auto">
        <h2 className="text-2xl font-bold text-richblack-5 mb-2">
          {token ? "Recommended For You" : "Top Courses"}
        </h2>
        <p className="text-richblack-400 text-sm mb-6">
          {token ? "Based on your learning history" : "Most popular on StudyNotion"}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {courses.slice(0, 8).map((course) => (
            <Link
              to={`/courses/${course._id}`}
              key={course._id}
              className="bg-richblack-800 rounded-xl overflow-hidden hover:scale-105 transition-transform duration-200 border border-richblack-700"
            >
              <img
                src={course.thumbnail}
                alt={course.courseName}
                className="w-full h-36 object-cover"
              />
              <div className="p-3">
                <p className="text-white font-semibold text-sm line-clamp-2 mb-1">
                  {course.courseName}
                </p>
                <p className="text-richblack-400 text-xs mb-2">
                  {course.instructor?.firstName} {course.instructor?.lastName}
                </p>
                <div className="flex items-center gap-1 mb-2">
                  <span className="text-yellow-50 text-xs font-bold">{(course.avgRating || 0).toFixed(1)}</span>
                  <RatingStars Review_Count={course.avgRating || 0} Star_Size={12} />
                  <span className="text-richblack-400 text-xs">({course.ratingAndReviews?.length || 0})</span>
                </div>
                <p className="text-yellow-50 font-bold text-sm">
                  {course.price === 0 ? "Free" : `₹${course.price}`}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
