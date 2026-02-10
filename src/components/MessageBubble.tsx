interface MessageBubbleProps {
  content: string;
  isMine: boolean;
  senderName?: string;
  timestamp?: string;
}

const MessageBubble = ({ content, isMine, senderName, timestamp }: MessageBubbleProps) => {
  return (
    <div className={`flex ${isMine ? "justify-end" : "justify-start"} mb-2`}>
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
          isMine
            ? "campus-gradient text-primary-foreground rounded-br-md"
            : "bg-muted text-foreground rounded-bl-md"
        }`}
      >
        {!isMine && senderName && (
          <p className="mb-0.5 text-xs font-semibold opacity-70">{senderName}</p>
        )}
        <p>{content}</p>
        {timestamp && (
          <p className={`mt-1 text-[10px] ${isMine ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
            {new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </p>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
