import React from "react";

export default function ContactItem({ contact, isOnline, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex flex-col items-center gap-1 py-3 px-1 transition ${
        isActive ? "bg-richblack-600" : "hover:bg-richblack-700"
      }`}
    >
      <div className="relative">
        <img
          src={contact.image}
          alt={contact.firstName}
          className="w-9 h-9 rounded-full object-cover"
        />
        <span
          className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-richblack-800 ${
            isOnline ? "bg-green-500" : "bg-richblack-400"
          }`}
        />
      </div>
      <span className="text-white text-[10px] truncate w-full text-center leading-tight">
        {contact.firstName}
      </span>
    </button>
  );
}
