import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { appendMessage, setActiveContact, setMessages, closeChat } from "../../../slices/chatSlice";
import { fetchContacts, fetchChatHistory, getRoomId, sendAIMessage } from "../../../services/operations/chatAPI";
import { getSocket } from "../../../services/socket";
import ContactItem from "./ContactItem";
import MessageBubble from "./MessageBubble";
import { IoClose, IoSend, IoSparkles } from "react-icons/io5";
import toast from "react-hot-toast";

const AI_CONTACT = { _id: "ai-assistant", firstName: "StudyBot", lastName: "", isAI: true };

export default function ChatWindow() {
  const dispatch = useDispatch();
  const { token } = useSelector((s) => s.auth);
  const { user } = useSelector((s) => s.profile);
  const { contacts, activeContact, messages, onlineUsers } = useSelector((s) => s.chat);

  const [text, setText] = useState("");
  const [roomId, setRoomId] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [aiHistory, setAiHistory] = useState([]);
  const [aiMessages, setAiMessages] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);

  const typingTimer = useRef(null);
  const bottomRef = useRef(null);
  const socket = getSocket();

  const isAIMode = activeContact?._id === "ai-assistant";

  useEffect(() => {
    dispatch(fetchContacts(token));
  }, [dispatch, token]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, aiMessages]);

  // Socket listeners
  useEffect(() => {
    if (!socket) return;
    socket.on("receive_message", (msg) => dispatch(appendMessage(msg)));
    socket.on("user_typing", () => setIsTyping(true));
    socket.on("user_stop_typing", () => setIsTyping(false));
    return () => {
      socket.off("receive_message");
      socket.off("user_typing");
      socket.off("user_stop_typing");
    };
  }, [socket, dispatch]);

  const selectContact = async (contact) => {
    if (contact._id === "ai-assistant") {
      dispatch(setActiveContact(contact));
      dispatch(setMessages([]));
      setRoomId(null);
      return;
    }
    dispatch(setActiveContact(contact));
    dispatch(setMessages([]));
    const id = await getRoomId(contact._id, token);
    setRoomId(id);
    socket?.emit("join_room", { roomId: id });
    dispatch(fetchChatHistory(id, token));
  };

  const sendMessage = () => {
    if (!text.trim()) return;
    if (isAIMode) {
      sendToAI(text.trim());
    } else {
      if (!roomId || !socket) return;
      socket.emit("send_message", { roomId, receiverId: activeContact._id, content: text.trim() });
      socket.emit("stop_typing", { roomId });
    }
    setText("");
  };

  const sendToAI = async (msg) => {
    const userMsg = { role: "user", content: msg, createdAt: new Date().toISOString(), sender: user?._id };
    setAiMessages((prev) => [...prev, userMsg]);
    setAiLoading(true);

    try {
      const data = await sendAIMessage(msg, aiHistory, token);
      const botMsg = {
        role: "assistant",
        content: data.response,
        createdAt: new Date().toISOString(),
        sender: "ai-assistant",
      };
      setAiMessages((prev) => [...prev, botMsg]);
      setAiHistory((prev) => [
        ...prev,
        { role: "user", content: msg },
        { role: "assistant", content: data.response },
      ]);

      if (data.instructorAvailable && data.instructorNames?.length > 0) {
        // Already mentioned in AI response, no extra toast needed
      }
    } catch {
      toast.error("AI assistant unavailable. Please try again.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const handleTyping = (e) => {
    setText(e.target.value);
    if (!isAIMode && roomId && socket) {
      socket.emit("typing", { roomId });
      clearTimeout(typingTimer.current);
      typingTimer.current = setTimeout(() => socket.emit("stop_typing", { roomId }), 1500);
    }
  };

  const displayMessages = isAIMode ? aiMessages : messages;
  const allContacts = [AI_CONTACT, ...contacts];

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col w-[380px] h-[540px] bg-richblack-800 rounded-xl shadow-2xl border border-richblack-600 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-richblack-700 border-b border-richblack-600">
        <div className="flex items-center gap-2">
          {isAIMode && <IoSparkles size={16} className="text-yellow-50" />}
          <span className="text-white font-semibold text-sm">
            {activeContact
              ? isAIMode
                ? "StudyBot — AI Assistant"
                : `${activeContact.firstName} ${activeContact.lastName}`
              : "Messages"}
          </span>
          {isAIMode && (
            <span className="text-[10px] bg-yellow-50 text-richblack-900 px-2 py-0.5 rounded-full font-semibold">
              AI
            </span>
          )}
        </div>
        <button onClick={() => dispatch(closeChat())} className="text-richblack-300 hover:text-white transition">
          <IoClose size={18} />
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Contact list */}
        <div className="w-[110px] border-r border-richblack-600 overflow-y-auto bg-richblack-800 flex-shrink-0">
          {/* AI Assistant pinned at top */}
          <button
            onClick={() => selectContact(AI_CONTACT)}
            className={`w-full flex flex-col items-center gap-1 py-3 px-1 transition border-b border-richblack-600 ${
              isAIMode ? "bg-richblack-600" : "hover:bg-richblack-700"
            }`}
          >
            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-yellow-50 to-yellow-200 flex items-center justify-center">
                <IoSparkles size={18} className="text-richblack-900" />
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-richblack-800 bg-green-500" />
            </div>
            <span className="text-white text-[10px] truncate w-full text-center leading-tight">
              StudyBot
            </span>
          </button>

          {/* Real contacts */}
          {contacts.map((c) => (
            <ContactItem
              key={c._id}
              contact={c}
              isOnline={onlineUsers.includes(c._id)}
              isActive={activeContact?._id === c._id}
              onClick={() => selectContact(c)}
            />
          ))}
          {contacts.length === 0 && (
            <p className="text-richblack-400 text-[10px] p-2 text-center mt-2">
              No teachers yet
            </p>
          )}
        </div>

        {/* Messages pane */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {activeContact ? (
            <>
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {/* AI welcome message */}
                {isAIMode && aiMessages.length === 0 && (
                  <div className="flex justify-start">
                    <div className="max-w-[85%] px-3 py-2 rounded-2xl rounded-bl-sm bg-richblack-600 text-white text-sm leading-snug">
                      <p className="break-words">
                        Hi {user?.firstName}! I'm StudyBot, your AI learning assistant. Ask me anything about your courses, concepts, or learning questions!
                      </p>
                      <p className="text-[10px] mt-1 text-richblack-400 text-right">Now</p>
                    </div>
                  </div>
                )}

                {/* Messages */}
                {displayMessages.map((msg, i) => {
                  if (isAIMode) {
                    const isMine = msg.role === "user";
                    return (
                      <div key={i} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                        {!isMine && (
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-yellow-50 to-yellow-200 flex items-center justify-center mr-1 flex-shrink-0 mt-1">
                            <IoSparkles size={12} className="text-richblack-900" />
                          </div>
                        )}
                        <div
                          className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm leading-snug ${
                            isMine
                              ? "bg-yellow-50 text-richblack-900 rounded-br-sm"
                              : "bg-richblack-600 text-white rounded-bl-sm"
                          }`}
                        >
                          <p className="break-words whitespace-pre-wrap">{msg.content}</p>
                          <p className={`text-[10px] mt-1 text-right ${isMine ? "text-richblack-600" : "text-richblack-400"}`}>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      </div>
                    );
                  }
                  return <MessageBubble key={msg._id} msg={msg} currentUserId={user?._id} />;
                })}

                {/* AI typing indicator */}
                {isAIMode && aiLoading && (
                  <div className="flex justify-start items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-yellow-50 to-yellow-200 flex items-center justify-center flex-shrink-0">
                      <IoSparkles size={12} className="text-richblack-900" />
                    </div>
                    <div className="bg-richblack-600 rounded-2xl rounded-bl-sm px-3 py-2">
                      <div className="flex gap-1 items-center h-4">
                        <span className="w-1.5 h-1.5 bg-richblack-300 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-1.5 h-1.5 bg-richblack-300 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-1.5 h-1.5 bg-richblack-300 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  </div>
                )}

                {/* Human typing indicator */}
                {!isAIMode && isTyping && (
                  <p className="text-xs text-richblack-400 italic">
                    {activeContact.firstName} is typing…
                  </p>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div className="flex items-center gap-2 p-2 border-t border-richblack-600 bg-richblack-700">
                <textarea
                  rows={1}
                  value={text}
                  onChange={handleTyping}
                  onKeyDown={handleKeyDown}
                  placeholder={isAIMode ? "Ask StudyBot anything…" : "Type a message…"}
                  disabled={isAIMode && aiLoading}
                  className="flex-1 resize-none bg-richblack-600 text-white text-sm rounded-lg px-3 py-2 outline-none placeholder:text-richblack-400 disabled:opacity-50"
                />
                <button
                  onClick={sendMessage}
                  disabled={!text.trim() || (isAIMode && aiLoading)}
                  className="p-2 bg-yellow-50 rounded-lg text-black disabled:opacity-40 hover:bg-yellow-25 transition"
                >
                  <IoSend size={16} />
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center flex-1 text-richblack-400 text-xs text-center px-4 gap-3">
              <IoSparkles size={28} className="text-yellow-50 opacity-60" />
              <p>Select <span className="text-yellow-50 font-semibold">StudyBot</span> for AI help or a teacher to chat</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
