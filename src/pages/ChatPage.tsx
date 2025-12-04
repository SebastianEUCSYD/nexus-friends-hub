import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Avatar } from "@/components/Avatar";
import { Button } from "@/components/ui/button";
import { useChats } from "@/hooks/useChats";
import { useProfiles } from "@/hooks/useProfiles";
import { Search, MessageCircle, UserPlus, Bell } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ChatPage() {
  const navigate = useNavigate();
  const { chats, loading } = useChats();
  const { profiles } = useProfiles();
  const [searchQuery, setSearchQuery] = useState("");

  // Get friends (accepted friendships)
  const friends = profiles.filter(p => p.friendshipStatus === "accepted");
  
  // Get pending friend requests count
  const pendingRequests = profiles.filter(p => p.friendshipStatus === "requested");

  // Filter friends by search query (name or username)
  const filteredFriends = friends.filter((friend) =>
    friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (friend.username && friend.username.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Get chats for filtered friends
  const filteredChats = chats.filter((chat) => {
    const friend = friends.find(f => f.user_id === chat.friendId);
    if (!friend) return false;
    if (!searchQuery) return true;
    return friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (friend.username && friend.username.toLowerCase().includes(searchQuery.toLowerCase()));
  });

  return (
    <div className="min-h-screen pb-24">
      <PageHeader title="Chat" subtitle="Dine samtaler">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate("/friend-requests")}
          className="relative"
        >
          <Bell className="h-5 w-5" />
          {pendingRequests.length > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full gradient-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
              {pendingRequests.length}
            </span>
          )}
        </Button>
      </PageHeader>

      <div className="px-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Søg efter venner (navn eller @brugernavn)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12 pl-12 pr-4 rounded-2xl bg-secondary text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          />
        </div>

        {/* Search Results - Show matching friends */}
        {searchQuery && filteredFriends.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground px-1">Venner</p>
            {filteredFriends.map((friend) => (
              <button
                key={friend.id}
                onClick={() => navigate(`/user/${friend.user_id}`)}
                className="w-full flex items-center gap-3 p-3 rounded-2xl bg-card hover:bg-secondary/50 transition-all"
              >
                <Avatar
                  src={friend.avatar_url || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"}
                  alt={friend.name}
                  size="md"
                  isOnline={friend.is_online}
                />
                <div className="text-left">
                  <p className="font-medium text-foreground">{friend.name}</p>
                  {friend.username && (
                    <p className="text-sm text-muted-foreground">@{friend.username}</p>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}

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
          ) : friends.length > 0 && !searchQuery ? (
            <div className="text-center py-12">
              <div className="h-16 w-16 mx-auto rounded-full bg-secondary flex items-center justify-center mb-4">
                <MessageCircle className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground mb-4">
                Ingen beskeder endnu. Start en samtale med en af dine venner!
              </p>
              <Button variant="gradient" onClick={() => navigate("/discover")}>
                <UserPlus className="h-4 w-4" />
                Find flere venner
              </Button>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="h-16 w-16 mx-auto rounded-full bg-secondary flex items-center justify-center mb-4">
                <MessageCircle className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground mb-4">
                {searchQuery
                  ? "Ingen venner fundet med det navn"
                  : "Ingen venner endnu. Find nye venner under 'Opdag'!"}
              </p>
              {!searchQuery && (
                <Button variant="gradient" onClick={() => navigate("/discover")}>
                  <UserPlus className="h-4 w-4" />
                  Find venner
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
