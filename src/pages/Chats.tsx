import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "@/api/axios";
import { useAuth } from "@/context/AuthContext";
import ChatSidebar from "@/components/ChatSidebar";
import MessageBubble from "@/components/MessageBubble";
import Navbar from "@/components/Navbar";
import { toast } from "sonner";
import { Send, ArrowLeft } from "lucide-react";

const Chats = () => {
  const { chatId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [chats, setChats] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showSidebar, setShowSidebar] = useState(!chatId);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const { data } = await API.get("/chats");
        setChats(data);
      } catch {
        toast.error("Failed to load conversations");
      } finally {
        setLoadingChats(false);
      }
    };
    fetchChats();
  }, []);

  useEffect(() => {
    if (!chatId) {
      setMessages([]);
      return;
    }
    const fetchMessages = async () => {
      setLoadingMessages(true);
      try {
        const { data } = await API.get(`/chats/${chatId}/messages`);
        setMessages(data);
      } catch {
        toast.error("Failed to load messages");
      } finally {
        setLoadingMessages(false);
      }
    };
    fetchMessages();
    setShowSidebar(false);
  }, [chatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !chatId) return;
    setSending(true);
    try {
      const { data } = await API.post(`/chats/${chatId}/messages`, { content: newMessage.trim() });
      setMessages((prev) => [...prev, data]);
      setNewMessage("");
    } catch {
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const selectChat = (id: string) => {
    navigate(`/chats/${id}`);
  };

  return (
    <div className="flex h-screen flex-col bg-background">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - always visible on desktop, toggle on mobile */}
        <div className={`${showSidebar ? "flex" : "hidden"} w-full flex-col md:flex md:w-80`}>
          {loadingChats ? (
            <div className="flex flex-1 items-center justify-center border-r border-border bg-card">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : (
            <ChatSidebar
              chats={chats}
              activeChatId={chatId || null}
              currentUserId={user?._id || ""}
              onSelect={selectChat}
            />
          )}
        </div>

        {/* Message panel */}
        <div className={`${!showSidebar ? "flex" : "hidden"} flex-1 flex-col md:flex`}>
          {chatId ? (
            <>
              {/* Chat header */}
              <div className="flex items-center gap-3 border-b border-border bg-card px-4 py-3">
                <button
                  onClick={() => setShowSidebar(true)}
                  className="md:hidden"
                >
                  <ArrowLeft className="h-5 w-5 text-foreground" />
                </button>
                <p className="font-medium text-card-foreground">
                  {chats.find((c) => c._id === chatId)?.users.find((u: any) => u._id !== user?._id)?.name || "Chat"}
                </p>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4">
                {loadingMessages ? (
                  <div className="flex h-full items-center justify-center">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  </div>
                ) : messages.length === 0 ? (
                  <p className="mt-10 text-center text-sm text-muted-foreground">
                    No messages yet. Say hello!
                  </p>
                ) : (
                  messages.map((msg, i) => (
                    <MessageBubble
                      key={msg._id || i}
                      content={msg.content}
                      isMine={msg.sender?._id === user?._id || msg.sender === user?._id}
                      senderName={msg.sender?.name}
                      timestamp={msg.createdAt}
                    />
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <form onSubmit={handleSend} className="border-t border-border bg-card p-4">
                <div className="flex gap-2">
                  <input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 rounded-lg border border-input bg-background py-2.5 px-4 text-sm text-foreground outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/20"
                  />
                  <button
                    type="submit"
                    disabled={sending || !newMessage.trim()}
                    className="flex items-center justify-center rounded-lg campus-gradient px-4 text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center">
              <p className="text-muted-foreground">Select a conversation to start chatting</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chats;
