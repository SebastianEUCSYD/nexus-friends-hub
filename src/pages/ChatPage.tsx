import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Avatar } from "@/components/Avatar";
import { useChats } from "@/hooks/useChats";
import { Search, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ChatPage() {
  const navigate = useNavigate();
  const { chats, loading } = useChats();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredChats = chats.filter((chat) =>
    chat.friendName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen pb-24">
      <PageHeader title="Chat" subtitle="Dine samtaler" />

      <div className="px-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Søg i samtaler..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12 pl-12 pr-4 rounded-2xl bg-secondary text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          />
        </div>

        {/* Chat List */}
        <div className="space-y-3">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-20 bg-card rounded-2xl animate-pulse"
                />
              ))}
            </div>
          ) : filteredChats.length > 0 ? (
            filteredChats.map((chat, index) => (
              <button
                key={chat.id}
                onClick={() => navigate(`/chat/${chat.friendId}`)}
                className="w-full flex items-center gap-3 p-4 rounded-2xl bg-card hover:bg-secondary/50 transition-all duration-200 shadow-soft active:scale-[0.98] animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <Avatar
                  src={chat.friendAvatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"}
                  alt={chat.friendName}
                  size="lg"
                  isOnline={chat.isOnline}
                />
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-foreground truncate">
                      {chat.friendName}
                    </h3>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {chat.lastMessageTime}
                    </span>
                  </div>
                  <p
                    className={cn(
                      "text-sm truncate",
                      chat.unreadCount > 0
                        ? "text-foreground font-medium"
                        : "text-muted-foreground"
                    )}
                  >
                    {chat.lastMessage}
                  </p>
                </div>
                {chat.unreadCount > 0 && (
                  <span className="shrink-0 h-6 min-w-6 px-2 rounded-full gradient-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                    {chat.unreadCount}
                  </span>
                )}
              </button>
            ))
          ) : (
            <div className="text-center py-12">
              <div className="h-16 w-16 mx-auto rounded-full bg-secondary flex items-center justify-center mb-4">
                <MessageCircle className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">
                {searchQuery
                  ? "Ingen samtaler fundet"
                  : "Ingen venner endnu. Find nye venner under 'Opdag'!"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
