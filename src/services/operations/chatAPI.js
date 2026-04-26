import { apiConnector } from "../apiconnector";
import { setContacts, setMessages, setUnreadCount } from "../../slices/chatSlice";
import toast from "react-hot-toast";

const BASE = process.env.REACT_APP_BASE_URL || "http://localhost:4000/api/v1";
const CHAT_API = {
  CONTACTS: `${BASE}/chat/contacts`,
  HISTORY: (roomId) => `${BASE}/chat/history/${roomId}`,
  UNREAD: `${BASE}/chat/unread-count`,
  ROOM: (otherId) => `${BASE}/chat/room/${otherId}`,
};

export const fetchContacts = (token) => async (dispatch) => {
  try {
    const res = await apiConnector("GET", CHAT_API.CONTACTS, null, { Authorization: `Bearer ${token}` });
    dispatch(setContacts(res.data.data));
  } catch {
    toast.error("Failed to load contacts");
  }
};

export const fetchChatHistory = (roomId, token) => async (dispatch) => {
  try {
    const res = await apiConnector("GET", CHAT_API.HISTORY(roomId), null, { Authorization: `Bearer ${token}` });
    dispatch(setMessages(res.data.data));
  } catch {
    toast.error("Failed to load messages");
  }
};

export const fetchUnreadCount = (token) => async (dispatch) => {
  try {
    const res = await apiConnector("GET", CHAT_API.UNREAD, null, { Authorization: `Bearer ${token}` });
    dispatch(setUnreadCount(res.data.count));
  } catch {}
};

export const getRoomId = async (otherId, token) => {
  const res = await apiConnector("GET", CHAT_API.ROOM(otherId), null, { Authorization: `Bearer ${token}` });
  return res.data.roomId;
};

export const sendAIMessage = async (message, conversationHistory, token) => {
  const res = await apiConnector(
    "POST",
    `${BASE}/chat/ai`,
    { message, conversationHistory },
    { Authorization: `Bearer ${token}` }
  );
  return res.data;
};
