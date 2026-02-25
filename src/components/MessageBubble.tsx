import { cn } from "@/lib/utils";
import { Play, FileText, Download } from "lucide-react";
import { useState } from "react";

interface MessageBubbleProps {
  content: string;
  isMe: boolean;
  time: string;
  attachmentUrl?: string | null;
  attachmentType?: string | null;
}

export function MessageBubble({ content, isMe, time, attachmentUrl, attachmentType }: MessageBubbleProps) {
  const [videoPlaying, setVideoPlaying] = useState(false);

  const renderAttachment = () => {
    if (!attachmentUrl || !attachmentType) return null;

    if (attachmentType.startsWith("image/")) {
      return (
        <a href={attachmentUrl} target="_blank" rel="noopener noreferrer" className="block mb-1">
          <img
            src={attachmentUrl}
            alt="Billede"
            className="rounded-xl max-w-full max-h-64 object-cover"
            loading="lazy"
          />
        </a>
      );
    }

    if (attachmentType.startsWith("video/")) {
      return (
        <div className="mb-1 rounded-xl overflow-hidden max-w-full">
          <video
            src={attachmentUrl}
            controls
            className="max-w-full max-h-64 rounded-xl"
            preload="metadata"
            playsInline
          />
        </div>
      );
    }

    // Generic file
    const fileName = attachmentUrl.split("/").pop()?.split("?")[0] || "Fil";
    return (
      <a
        href={attachmentUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "flex items-center gap-2 mb-1 p-2 rounded-xl transition-colors",
          isMe ? "bg-primary-foreground/10 hover:bg-primary-foreground/20" : "bg-secondary hover:bg-secondary/80"
        )}
      >
        <FileText className="h-5 w-5 shrink-0" />
        <span className="text-sm truncate">{decodeURIComponent(fileName)}</span>
        <Download className="h-4 w-4 shrink-0 ml-auto" />
      </a>
    );
  };

  const hasContent = content && content.trim().length > 0;

  return (
    <div className={cn("flex", isMe ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[75%] px-4 py-2 rounded-2xl",
          isMe
            ? "gradient-primary text-primary-foreground rounded-br-md"
            : "bg-card text-foreground rounded-bl-md shadow-soft"
        )}
      >
        {renderAttachment()}
        {hasContent && <p className="break-words">{content}</p>}
        <p
          className={cn(
            "text-xs mt-1",
            isMe ? "text-primary-foreground/70" : "text-muted-foreground"
          )}
        >
          {time}
        </p>
      </div>
    </div>
  );
}
