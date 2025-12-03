import { Chat } from "@/types";
import { Avatar } from "./Avatar";
import { cn } from "@/lib/utils";

interface ChatItemProps {
  chat: Chat;
  onClick: () => void;
}

export function ChatItem({ chat, onClick }: ChatItemProps) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 p-4 rounded-2xl bg-card hover:bg-secondary/50 transition-all duration-200 shadow-soft active:scale-[0.98]"
    >
      <Avatar 
        src={chat.user.avatar} 
        alt={chat.user.name} 
        size="lg" 
        isOnline={chat.user.isOnline} 
      />
      <div className="flex-1 min-w-0 text-left">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-semibold text-foreground truncate">{chat.user.name}</h3>
          <span className="text-xs text-muted-foreground shrink-0">{chat.timestamp}</span>
        </div>
        <p className={cn(
          "text-sm truncate",
          chat.unreadCount > 0 ? "text-foreground font-medium" : "text-muted-foreground"
        )}>
          {chat.lastMessage}
        </p>
      </div>
      {chat.unreadCount > 0 && (
        <span className="shrink-0 h-6 min-w-6 px-2 rounded-full gradient-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
          {chat.unreadCount}
        </span>
      )}
    </button>
  );
}
