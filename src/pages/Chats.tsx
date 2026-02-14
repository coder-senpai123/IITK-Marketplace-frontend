import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "@/api/axios";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/context/SocketProvider";
import ChatSidebar from "@/components/ChatSidebar";
import MessageBubble from "@/components/MessageBubble";
import Navbar from "@/components/Navbar";
import { toast } from "sonner";
import { Send, ArrowLeft, Paperclip, X, Image as ImageIcon, FileText } from "lucide-react";
import { Chat } from "@/types/chat";

const Chats = () => {
  const { chatId, itemId } = useParams();
  const { user } = useAuth();
  const { socketRef } = useSocket();
  const navigate = useNavigate();
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [uploading, setUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showSidebar, setShowSidebar] = useState(!chatId && !itemId);

  // Pending item info (when opening a chat via /chats/item/:itemId)
  const [pendingItem, setPendingItem] = useState<any>(null);
  const [loadingPendingItem, setLoadingPendingItem] = useState(false);

  // Check if this is a pending (not-yet-created) chat
  const isPending = !!itemId && !chatId;

  // Fetch the item info when we have an itemId (pending chat)
  useEffect(() => {
    if (!itemId) { setPendingItem(null); return; }
    const fetchItem = async () => {
      setLoadingPendingItem(true);
      try {
        const { data } = await API.get(`/items/${itemId}`);
        setPendingItem(data.data);
      } catch {
        toast.error("Failed to load item details");
      } finally {
        setLoadingPendingItem(false);
      }
    };

    // Check if there's already an existing chat for this item
    const checkExistingChat = async () => {
      try {
        const { data } = await API.get("/chats");
        const existingChats: Chat[] = Array.isArray(data.data) ? data.data : [];
        const existing = existingChats.find(
          (c: Chat) => c.item?._id === itemId
        );
        if (existing) {
          // Already have a chat for this item, redirect to it
          navigate(`/chats/${existing._id}`, { replace: true });
          return;
        }
      } catch {
        // Ignore — we'll just show the pending UI
      }
      fetchItem();
    };

    checkExistingChat();
  }, [itemId, navigate]);

  // Listen for chat_created from server (lazy creation redirect)
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    const handler = (data: { chatId: string; itemId: string }) => {
      if (data.itemId === itemId) {
        navigate(`/chats/${data.chatId}`, { replace: true });
      }
    };
    socket.on("chat_created", handler);
    return () => { socket.off("chat_created", handler); };
  }, [itemId, socketRef, navigate]);

  // Join chat room + listen for messages
  useEffect(() => {
    if (!user || !chatId) return;
    const socket = socketRef.current;
    if (!socket) return;

    socket.emit("join_chat", chatId);

    const handler = (msg: any) => {
      const msgChatId = msg.chatId?._id || msg.chatId;
      if (msgChatId === chatId) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === msg._id)) return prev;
          return [...prev, msg];
        });
      }
    };

    socket.on("receive_message", handler);
    return () => { socket.off("receive_message", handler); };
  }, [chatId, user, socketRef]);

  // Fetch chats
  useEffect(() => {
    const fetchChats = async () => {
      try {
        const { data } = await API.get("/chats");
        const rawChats = Array.isArray(data.data) ? data.data : [];
        const unique: Chat[] = Array.from(
          new Map<string, Chat>(rawChats.map((c: Chat) => [c._id, c])).values()
        );
        setChats(unique);
      } catch {
        toast.error("Failed to load conversations");
      } finally {
        setLoadingChats(false);
      }
    };
    fetchChats();
  }, [chatId]);

  // Fetch messages
  useEffect(() => {
    if (!chatId) { setMessages([]); return; }
    const fetchMessages = async () => {
      setLoadingMessages(true);
      try {
        const { data } = await API.get(`/chats/${chatId}/messages`);
        setMessages(Array.isArray(data.data) ? data.data : []);
      } catch {
        toast.error("Failed to load messages");
      } finally {
        setLoadingMessages(false);
      }
    };
    fetchMessages();
    setShowSidebar(false);
  }, [chatId, user]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send text — works for both existing chats and pending item chats
  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !socketRef.current) return;

    const targetId = chatId || itemId;
    if (!targetId) return;

    const content = newMessage.trim();
    setNewMessage("");
    socketRef.current.emit("send_message", { chatId: targetId, content, type: "text" });
  };

  // Upload file then send via socket
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = "";

    // Validate size
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be under 5 MB");
      return;
    }

    // For pending chats, we need to create the chat first via a text-like flow
    if (isPending && itemId) {
      // For file uploads on pending chats, first create the chat by sending
      // a message via socket (which triggers lazy creation), then upload
      setUploading(true);
      try {
        // Create chat lazily by sending a placeholder, then the file
        // Actually, we need a real chatId for the upload endpoint.
        // So let's create the chat via API first.
        const chatRes = await API.post("/chats", { itemId });
        const realChatId = chatRes.data.data._id;

        const formData = new FormData();
        formData.append("file", file);

        const { data } = await API.post(`/chats/${realChatId}/upload`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        const fileMeta = data.data;

        socketRef.current?.emit("send_message", {
          chatId: realChatId,
          content: fileMeta.type === "image" ? "📷 Image" : `📎 ${fileMeta.fileName}`,
          type: fileMeta.type,
          fileUrl: fileMeta.fileUrl,
          fileName: fileMeta.fileName,
          mimeType: fileMeta.mimeType,
        });

        navigate(`/chats/${realChatId}`, { replace: true });
      } catch (err: any) {
        toast.error(err.response?.data?.message || "File upload failed");
      } finally {
        setUploading(false);
      }
      return;
    }

    if (!chatId) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const { data } = await API.post(`/chats/${chatId}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const fileMeta = data.data;

      socketRef.current?.emit("send_message", {
        chatId,
        content: fileMeta.type === "image" ? "📷 Image" : `📎 ${fileMeta.fileName}`,
        type: fileMeta.type,
        fileUrl: fileMeta.fileUrl,
        fileName: fileMeta.fileName,
        mimeType: fileMeta.mimeType,
      });
    } catch (err: any) {
      toast.error(err.response?.data?.message || "File upload failed");
    } finally {
      setUploading(false);
    }
  };

  const selectChat = (id: string) => navigate(`/chats/${id}`);

  // Determine active chat info — either from loaded chats or from pending item
  const activeChat = chats.find((c) => c._id === chatId);
  const otherUser = activeChat?.participants?.filter(
    (u: any) => String(u._id) !== String(user?._id)
  )[0];

  // For pending chats, use item data from the pendingItem
  const chatItem = isPending ? pendingItem : activeChat?.item;
  const isReadOnly = chatItem?.status === "deleted";

  const pendingSellerEmail = isPending ? pendingItem?.seller?.email : null;
  const displayOtherUserEmail = isPending ? pendingSellerEmail : (otherUser?.email || "Unknown");

  const itemImgSrc = chatItem?.images?.[0]
    ? (chatItem.images[0].startsWith("http") ? chatItem.images[0] : `${import.meta.env.VITE_BACKEND_URL || "http://localhost:5000"}/${chatItem.images[0]}`)
    : null;

  const showMessagePanel = !!chatId || isPending;

  return (
    <div className="flex h-screen flex-col bg-background">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className={`${showSidebar ? "flex" : "hidden"} w-full flex-col md:flex md:w-80`}>
          {loadingChats || !user ? (
            <div className="flex flex-1 items-center justify-center border-r border-border bg-card">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : (
            <ChatSidebar
              chats={chats}
              activeChatId={chatId || null}
              currentUserId={user._id}
              onSelect={selectChat}
            />
          )}
        </div>

        {/* Message panel */}
        <div className={`${!showSidebar ? "flex" : "hidden"} flex-1 flex-col md:flex`}>
          {showMessagePanel ? (
            <>
              {/* Header with item context */}
              <div
                className="flex items-center gap-3 border-b border-border bg-card px-4 py-3 cursor-pointer"
                onClick={() => chatItem && navigate(`/dashboard`)}
              >
                <button onClick={(e) => { e.stopPropagation(); setShowSidebar(true); }} className="md:hidden">
                  <ArrowLeft className="h-5 w-5 text-foreground" />
                </button>

                {loadingPendingItem ? (
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 animate-pulse rounded-lg bg-muted" />
                    <div className="h-4 w-32 animate-pulse rounded bg-muted" />
                  </div>
                ) : (
                  <>
                    {itemImgSrc ? (
                      <img src={itemImgSrc} alt={chatItem?.title} className="h-10 w-10 rounded-lg object-cover" />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                        <ImageIcon className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="line-clamp-1 text-sm font-semibold text-card-foreground">
                          {chatItem?.title || "Chat"}
                        </p>
                        {chatItem?.status === "sold" && (
                          <span className="shrink-0 rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-red-600">
                            SOLD
                          </span>
                        )}
                        {chatItem?.status === "deleted" && (
                          <span className="shrink-0 rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-bold text-gray-500">
                            DELETED
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {chatItem?.price && (
                          <span className="font-medium text-accent">₹{chatItem.price.toLocaleString("en-IN")}</span>
                        )}
                        <span>• {displayOtherUserEmail}</span>
                      </div>
                    </div>
                  </>
                )}
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
                      isMine={String(msg.sender?._id) === String(user?._id)}
                      senderName={msg.sender?.email}
                      timestamp={msg.createdAt}
                      type={msg.type}
                      fileUrl={msg.fileUrl}
                      fileName={msg.fileName}
                      mimeType={msg.mimeType}
                    />
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input bar */}
              {isReadOnly ? (
                <div className="border-t border-border bg-card px-4 py-3 text-center text-sm text-muted-foreground">
                  This chat is read-only — the item has been deleted.
                </div>
              ) : (
                <form onSubmit={handleSend} className="border-t border-border bg-card p-4">
                  <div className="flex items-center gap-2">
                    {/* File upload */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,application/pdf"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-input text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
                      title="Attach file"
                    >
                      {uploading ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      ) : (
                        <Paperclip className="h-4 w-4" />
                      )}
                    </button>

                    <input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 rounded-lg border border-input bg-background py-2.5 px-4 text-sm text-foreground outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/20"
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim()}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg campus-gradient text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                </form>
              )}
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