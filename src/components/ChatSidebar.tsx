interface ChatUser {
  _id: string;
  name: string;
}

interface Chat {
  _id: string;
  users: ChatUser[];
  latestMessage?: { content: string };
}

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
            const otherUser = chat.users.find((u) => u._id !== currentUserId);
            const isActive = chat._id === activeChatId;
            return (
              <button
                key={chat._id}
                onClick={() => onSelect(chat._id)}
                className={`w-full border-b border-border px-4 py-3 text-left transition-colors hover:bg-muted ${isActive ? "bg-muted" : ""}`}
              >
                <p className="text-sm font-medium text-card-foreground">{otherUser?.name || "User"}</p>
                <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                  {chat.latestMessage?.content || "Start a conversation"}
                </p>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ChatSidebar;
