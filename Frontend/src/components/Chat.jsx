import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import socket from "../socket.js";
import { FaPaperPlane, FaSearch, FaEllipsisH } from "react-icons/fa";
import { searchUsers } from "../redux/chatSlice";
import moment from "moment";

const Chat = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const [chats, setChats] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [loadingChats, setLoadingChats] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState({});
  const [onlineStatus, setOnlineStatus] = useState({}); // Track online status of users

  const messagesEndRef = useRef(null);

  // Socket connection setup
  useEffect(() => {
    socket.connect();

    socket.on("connect", () => {
      console.log("✅ Connected to Socket.io:", socket.id);
    });

    socket.on("connect_error", (err) => {
      console.error("❌ Socket connection error:", err.message);
    });

    return () => {
      socket.off("connect");
      socket.off("connect_error");
    };
  }, []);

  // Join chat rooms and fetch chats
  useEffect(() => {
    if (user) {
      socket.emit("join", user._id);
      fetchChats();
    }
  }, [user]);

  // Listen for new messages and user status
  useEffect(() => {
    if (currentChat) {
      // Listen for messages
      socket.on("receiveMessage", (message) => {
        console.log("📩 Received real-time message:", message);
        if (message.chatId === currentChat._id) {
          setMessages((prev) => {
            if (!prev.some((msg) => msg._id === message._id)) {
              return [...prev, message];
            }
            return prev;
          });
        } else {
          setUnreadMessages((prev) => ({
            ...prev,
            [message.chatId]: (prev[message.chatId] || 0) + 1,
          }));
        }
      });

      // Listen for user status updates
      socket.on("userStatus", ({ userId, isOnline, lastSeen }) => {
        console.log(`👤 User ${userId} status: ${isOnline ? "online" : "offline"}`);
        setOnlineStatus((prev) => ({
          ...prev,
          [userId]: { isOnline, lastSeen },
        }));
      });
    }

    return () => {
      socket.off("receiveMessage");
      socket.off("userStatus");
    };
  }, [currentChat]);

  // Scroll to bottom when messages update
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Fetch chats
  const fetchChats = async () => {
    setLoadingChats(true);
    try {
      const res = await fetch("http://localhost:7000/api/chats", {
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        setChats(data);
        const initialUnread = {};
        data.forEach((chat) => {
          initialUnread[chat._id] = 0;
        });
        setUnreadMessages(initialUnread);
      }
    } catch (error) {
      console.error("Error fetching chats:", error);
    } finally {
      setLoadingChats(false);
    }
  };

  // Fetch messages for the selected chat
  const fetchMessages = async (chatId) => {
    setLoadingMessages(true);
    try {
      const res = await fetch(`http://localhost:7000/api/messages/${chatId}`, {
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        setMessages(data);
        setUnreadMessages((prev) => ({
          ...prev,
          [chatId]: 0,
        }));
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoadingMessages(false);
    }
  };

  // Handle chat selection
  const handleChatClick = (chat) => {
    setCurrentChat(chat);
    fetchMessages(chat._id);
  };

  // Send a message
  const sendMessage = async () => {
    if (!newMessage.trim() || !currentChat) return;

    const messageData = {
      chatId: currentChat._id,
      text: newMessage,
    };

    console.log("📨 Sending message:", messageData);

    try {
      const res = await fetch("http://localhost:7000/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(messageData),
      });

      if (res.ok) {
        const savedMessage = await res.json();
        console.log("✅ Message saved:", savedMessage);
        setNewMessage("");
      }
    } catch (error) {
      console.error("❌ Error sending message:", error);
    }
  };

  // Handle search
  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.length > 1) {
      try {
        const res = await dispatch(searchUsers(query)).unwrap();
        setSearchResults(res || []);
      } catch (error) {
        console.error("Search failed:", error);
        setSearchResults([]);
      }
    } else {
      setSearchResults([]);
    }
  };

  // Handle search result click (start a new chat)
  const handleSearchResultClick = async (selectedUser) => {
    setSearchQuery("");
    setSearchResults([]);

    const existingChat = chats.find((chat) =>
      chat.members.some((member) => member._id === selectedUser._id)
    );

    if (existingChat) {
      setCurrentChat(existingChat);
      fetchMessages(existingChat._id);
    } else {
      try {
        const res = await fetch("http://localhost:7000/api/chats", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ userId: selectedUser._id }),
        });

        if (res.ok) {
          const newChat = await res.json();
          const enrichedChat = {
            ...newChat,
            members: [user, selectedUser],
          };
          setChats((prev) => [...prev, enrichedChat]);
          setCurrentChat(enrichedChat);
          fetchMessages(newChat._id);
          setUnreadMessages((prev) => ({ ...prev, [newChat._id]: 0 }));
        }
      } catch (error) {
        console.error("Error creating chat:", error);
      }
    }
  };

  // Get the status of the other user in the chat
  const getFriendStatus = () => {
    if (!currentChat) return "Offline";
    const friend = currentChat.members.find((p) => p._id !== user._id);
    const status = onlineStatus[friend?._id];
    if (status?.isOnline) {
      return "Active now";
    } else if (status?.lastSeen) {
      return `Last seen ${moment(status.lastSeen).fromNow()}`;
    }
    return "Offline";
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {/* Sidebar */}
      <div className="w-1/4 bg-white border-r shadow-sm overflow-y-auto">
        <div className="p-4 sticky top-0 bg-white z-10 border-b">
          <h2 className="text-2xl font-semibold text-gray-800">Messages</h2>
          <div className="mt-3 relative">
            <input
              type="text"
              placeholder="Search people..."
              value={searchQuery}
              onChange={handleSearch}
              className="w-full p-2 pl-10 border rounded-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
            <FaSearch className="absolute left-3 top-3 text-gray-500" />
          </div>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="absolute left-4 right-4 bg-white border rounded-lg shadow-lg z-20 max-h-64 overflow-y-auto">
            {searchResults.map((user) => (
              <button
                key={user._id}
                className="flex items-center gap-3 p-3 w-full text-left hover:bg-blue-50 transition-all"
                onClick={() => handleSearchResultClick(user)}
              >
                <img
                  src={user.profilePic.url || "/default-avatar.png"}
                  alt={user.name}
                  className="w-10 h-10 rounded-full border border-gray-200"
                />
                <div className="flex flex-col">
                  <p className="font-medium text-gray-800">{user.name}</p>
                  <p className="text-sm text-gray-500">Start a chat</p>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Chat List */}
        <div className="p-2">
          {loadingChats ? (
            <p className="text-center text-gray-500">Loading chats...</p>
          ) : chats.length > 0 ? (
            chats.map((chat) => {
              const friend = chat.members.find((p) => p._id !== user._id);
              const unreadCount = unreadMessages[chat._id] || 0;

              return (
                <button
                  key={chat._id}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-all ${
                    currentChat?._id === chat._id ? "bg-blue-50" : ""
                  }`}
                  onClick={() => handleChatClick(chat)}
                >
                  <div className="relative">
                    <img
                      src={friend?.profilePic?.url || "/default-avatar.png"}
                      alt={friend?.name || "Unknown"}
                      className="w-12 h-12 rounded-full border border-gray-200"
                    />
                    {unreadCount > 0 && (
                      <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-gray-800">{friend?.name || "Unknown"}</p>
                    <p className="text-sm text-gray-500 truncate">Tap to open chat</p>
                  </div>
                  <span className="text-xs text-gray-400">
                    {moment(chat.updatedAt).fromNow()}
                  </span>
                </button>
              );
            })
          ) : (
            <p className="text-center text-gray-500">No chats yet. Start a new conversation!</p>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="w-3/4 flex flex-col bg-white">
        {currentChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 bg-white border-b shadow-sm flex items-center justify-between sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <img
                  src={
                    currentChat.members.find((p) => p._id !== user._id)?.profilePic?.url ||
                    "/default-avatar.png"
                  }
                  alt="Friend"
                  className="w-10 h-10 rounded-full border border-gray-200"
                />
                <div>
                  <h3 className="font-semibold text-gray-800">
                    {currentChat.members.find((p) => p._id !== user._id)?.name}
                  </h3>
                  <p className="text-sm text-gray-500">{getFriendStatus()}</p>
                </div>
              </div>
              <button className="text-gray-500 hover:text-gray-700">
                <FaEllipsisH />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
              {loadingMessages ? (
                <p className="text-center text-gray-500">Loading messages...</p>
              ) : messages.length > 0 ? (
                messages.map((msg, index) => {
                  const isSender = msg.sender._id === user._id;
                  const showTimestamp =
                    index === 0 ||
                    moment(msg.createdAt).diff(moment(messages[index - 1].createdAt), "minutes") > 5;

                  return (
                    <div key={msg._id} className="mb-4">
                      {showTimestamp && (
                        <div className="text-center text-xs text-gray-400 my-4">
                          {moment(msg.createdAt).format("MMMM D, YYYY, h:mm A")}
                        </div>
                      )}
                      <div
                        className={`flex ${isSender ? "justify-end" : "justify-start"} items-end gap-2`}
                      >
                        {!isSender && (
                          <img
                            src={msg.sender.profilePic?.url || "/default-avatar.png"}
                            alt={msg.sender.name}
                            className="w-8 h-8 rounded-full"
                          />
                        )}
                        <div
                          className={`p-3 rounded-2xl max-w-[70%] shadow-sm ${
                            isSender
                              ? "bg-blue-500 text-white rounded-br-none"
                              : "bg-white text-gray-800 rounded-bl-none border border-gray-200"
                          }`}
                        >
                          <p>{msg.text}</p>
                          <span className="text-xs opacity-75 mt-1 block">
                            {moment(msg.createdAt).format("h:mm A")}
                          </span>
                        </div>
                        {isSender && (
                          <img
                            src={user.profilePic?.url || "/default-avatar.png"}
                            alt={user.name}
                            className="w-8 h-8 rounded-full"
                          />
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-center text-gray-500 mt-10">
                  No messages yet. Say hi to start the conversation!
                </p>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 bg-white border-t flex items-center gap-3">
              <input
                type="text"
                className="flex-1 p-3 border rounded-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && sendMessage()}
              />
              <button
                onClick={sendMessage}
                className="bg-blue-500 text-white p-3 rounded-full hover:bg-blue-600 transition-all"
              >
                <FaPaperPlane />
              </button>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center flex-1 text-gray-500 bg-gray-50">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-700">Welcome to Messenger</h3>
              <p className="mt-2">Select a chat to start messaging or search for someone new!</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;