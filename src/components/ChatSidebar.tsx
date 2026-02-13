import { Chat } from "@/types/chat";
import { Tag } from "lucide-react";

interface ChatSidebarProps {
  chats: Chat[];
  activeChatId: string | null;
  currentUserId: string;
  onSelect: (chatId: string) => void;
}

const ChatSidebar = ({ chats, activeChatId, currentUserId, onSelect }: ChatSidebarProps) => {
  return (
    <div className="flex h-full flex-col border-r border-border bg-card">
      <div className="border-b border-border p-4">
        <h2 className="font-display text-lg font-semibold text-card-foreground">Messages</h2>
      </div>
      <div className="flex-1 overflow-y-auto">
        {chats.length === 0 ? (
          <p className="p-4 text-center text-sm text-muted-foreground">No conversations yet</p>
        ) : (
          chats.map((chat) => {
            if (!currentUserId) return null;

            const otherUser = chat.participants.find(
              (u) => String(u._id) !== String(currentUserId)
            );
            const isActive = chat._id === activeChatId;
            const item = chat.item;
            const imgSrc = item?.images?.[0]
              ? (item.images[0].startsWith("http") ? item.images[0] : `${import.meta.env.VITE_BACKEND_URL || "http://localhost:5000"}/${item.images[0]}`)
              : null;

            return (
              <button
                key={chat._id}
                onClick={() => onSelect(chat._id)}
                className={`flex w-full items-start gap-3 border-b border-border px-4 py-3 text-left transition-colors hover:bg-muted ${isActive ? "bg-muted" : ""}`}
              >
                {/* Item thumbnail */}
                {imgSrc ? (
                  <img
                    src={imgSrc}
                    alt={item?.title}
                    className="h-10 w-10 shrink-0 rounded-lg object-cover"
                  />
                ) : (
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  {/* Item title */}
                  {item && (
                    <p className="line-clamp-1 text-xs font-medium text-accent">
                      {item.title}
                      {item.status === "sold" && (
                        <span className="ml-1.5 rounded bg-red-100 px-1 py-0.5 text-[10px] font-bold text-red-600">SOLD</span>
                      )}
                    </p>
                  )}
                  {/* Other user */}
                  <p className="line-clamp-1 text-sm font-medium text-card-foreground">
                    {otherUser?.email || "Unknown"}
                  </p>
                  {/* Last message preview */}
                  <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                    {chat.latestMessage?.content || chat.lastMessage || "Start a conversation"}
                  </p>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ChatSidebar;
