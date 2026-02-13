import { FileText, Download } from "lucide-react";

interface MessageBubbleProps {
  content: string;
  isMine: boolean;
  senderName?: string;
  timestamp?: string;
  type?: "text" | "image" | "file";
  fileUrl?: string;
  fileName?: string;
  mimeType?: string;
}

const MessageBubble = ({
  content,
  isMine,
  senderName,
  timestamp,
  type = "text",
  fileUrl,
  fileName,
}: MessageBubbleProps) => {
  const bubbleBase = `max-w-[75%] rounded-2xl px-4 py-2.5 text-sm`;
  const bubbleColor = isMine
    ? "campus-gradient text-primary-foreground rounded-br-md"
    : "bg-muted text-foreground rounded-bl-md";

  const timeColor = isMine ? "text-primary-foreground/60" : "text-muted-foreground";

  const renderTimestamp = () =>
    timestamp ? (
      <p className={`mt-1 text-[10px] ${timeColor}`}>
        {new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
      </p>
    ) : null;

  // IMAGE MESSAGE
  if (type === "image" && fileUrl) {
    return (
      <div className={`flex ${isMine ? "justify-end" : "justify-start"} mb-2`}>
        <div className={`${bubbleBase} ${bubbleColor} max-w-[60%]`}>
          {!isMine && senderName && (
            <p className="mb-1 text-xs font-semibold opacity-70">{senderName}</p>
          )}
          <a href={fileUrl} target="_blank" rel="noopener noreferrer">
            <img
              src={fileUrl}
              alt={fileName || "Image"}
              className="max-h-64 w-full rounded-lg object-cover"
              loading="lazy"
            />
          </a>
          {content && content !== "📷 Image" && (
            <p className="mt-1.5">{content}</p>
          )}
          {renderTimestamp()}
        </div>
      </div>
    );
  }

  // FILE / PDF MESSAGE
  if (type === "file" && fileUrl) {
    return (
      <div className={`flex ${isMine ? "justify-end" : "justify-start"} mb-2`}>
        <div className={`${bubbleBase} ${bubbleColor}`}>
          {!isMine && senderName && (
            <p className="mb-1 text-xs font-semibold opacity-70">{senderName}</p>
          )}
          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-3 rounded-lg border p-3 transition-colors ${isMine
                ? "border-primary-foreground/20 hover:bg-primary-foreground/10"
                : "border-border hover:bg-background"
              }`}
          >
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${isMine ? "bg-primary-foreground/20" : "bg-red-100"
                }`}
            >
              <FileText className={`h-5 w-5 ${isMine ? "text-primary-foreground" : "text-red-600"}`} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="line-clamp-1 text-sm font-medium">{fileName || "Document"}</p>
              <p className={`text-xs ${isMine ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                PDF Document
              </p>
            </div>
            <Download className={`h-4 w-4 shrink-0 ${isMine ? "text-primary-foreground/60" : "text-muted-foreground"}`} />
          </a>
          {renderTimestamp()}
        </div>
      </div>
    );
  }

  // TEXT MESSAGE (default)
  return (
    <div className={`flex ${isMine ? "justify-end" : "justify-start"} mb-2`}>
      <div className={`${bubbleBase} ${bubbleColor}`}>
        {!isMine && senderName && (
          <p className="mb-0.5 text-xs font-semibold opacity-70">{senderName}</p>
        )}
        <p>{content}</p>
        {renderTimestamp()}
      </div>
    </div>
  );
};

export default MessageBubble;
