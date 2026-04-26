import React, { useState } from "react";
import AdminStats from "../components/core/Dashboard/AdminPanel/AdminStats";
import AdminUsers from "../components/core/Dashboard/AdminPanel/AdminUsers";
import AdminCourses from "../components/core/Dashboard/AdminPanel/AdminCourses";

const TABS = [
  { key: "stats", label: "Platform Stats" },
  { key: "users", label: "Manage Users" },
  { key: "courses", label: "Manage Courses" },
];

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState("stats");

  return (
    <div className="min-h-screen bg-richblack-900 text-white px-4 py-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-richblack-5">Admin Panel</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-richblack-700 pb-3">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-t-lg text-sm font-medium transition ${
              activeTab === tab.key
                ? "bg-yellow-50 text-richblack-900"
                : "text-richblack-300 hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div>
        {activeTab === "stats" && <AdminStats />}
        {activeTab === "users" && <AdminUsers />}
        {activeTab === "courses" && <AdminCourses />}
      </div>
    </div>
  );
}
