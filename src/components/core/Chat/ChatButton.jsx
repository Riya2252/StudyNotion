import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { IoChatbubblesOutline } from "react-icons/io5";
import { toggleChat } from "../../../slices/chatSlice";
import { fetchUnreadCount } from "../../../services/operations/chatAPI";

export default function ChatButton() {
  const dispatch = useDispatch();
  const { token } = useSelector((s) => s.auth);
  const { unreadCount } = useSelector((s) => s.chat);

  useEffect(() => {
    if (token) dispatch(fetchUnreadCount(token));
  }, [dispatch, token]);

  return (
    <button
      onClick={() => dispatch(toggleChat())}
      className="fixed bottom-4 right-4 z-40 bg-yellow-50 hover:bg-yellow-25 text-richblack-900 rounded-full p-3 shadow-lg transition"
      aria-label="Open chat"
    >
      <IoChatbubblesOutline size={24} />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </button>
  );
}
