import { createSlice } from "@reduxjs/toolkit";

const chatSlice = createSlice({
  name: "chat",
  initialState: {
    contacts: [],
    activeContact: null,
    messages: [],
    onlineUsers: [],
    unreadCount: 0,
    isOpen: false,
  },
  reducers: {
    setContacts(state, action) { state.contacts = action.payload; },
    setActiveContact(state, action) { state.activeContact = action.payload; },
    setMessages(state, action) { state.messages = action.payload; },
    appendMessage(state, action) { state.messages.push(action.payload); },
    setOnlineUsers(state, action) { state.onlineUsers = action.payload; },
    setUnreadCount(state, action) { state.unreadCount = action.payload; },
    toggleChat(state) { state.isOpen = !state.isOpen; },
    closeChat(state) { state.isOpen = false; },
    openChatWithAI(state) {
      state.isOpen = true;
      state.activeContact = { _id: "ai-assistant", firstName: "StudyBot", lastName: "", isAI: true };
      state.messages = [];
    },
  },
});

export const {
  setContacts, setActiveContact, setMessages, appendMessage,
  setOnlineUsers, setUnreadCount, toggleChat, closeChat, openChatWithAI,
} = chatSlice.actions;

export default chatSlice.reducer;
