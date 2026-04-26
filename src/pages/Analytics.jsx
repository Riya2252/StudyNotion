import React from "react";
import { useSelector } from "react-redux";
import StudentAnalytics from "../components/core/Dashboard/Analytics/StudentAnalytics";
import InstructorAnalytics from "../components/core/Dashboard/Analytics/InstructorAnalytics";

export default function Analytics() {
  const { user } = useSelector((s) => s.profile);

  return (
    <div className="min-h-screen bg-richblack-900 text-white px-4 py-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-richblack-5">My Analytics</h1>
      {user?.accountType === "Instructor" ? <InstructorAnalytics /> : <StudentAnalytics />}
    </div>
  );
}
