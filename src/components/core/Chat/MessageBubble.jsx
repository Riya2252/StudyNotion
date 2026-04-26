import React from "react";

export default function MessageBubble({ msg, currentUserId }) {
  const isMine = msg.sender?._id === currentUserId || msg.sender === currentUserId;
  const time = new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm leading-snug ${
          isMine
            ? "bg-yellow-50 text-richblack-900 rounded-br-sm"
            : "bg-richblack-600 text-white rounded-bl-sm"
        }`}
      >
        <p className="break-words">{msg.content}</p>
        <p className={`text-[10px] mt-1 text-right ${isMine ? "text-richblack-600" : "text-richblack-400"}`}>
          {time}
        </p>
      </div>
    </div>
  );
}
