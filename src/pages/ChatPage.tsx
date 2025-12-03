import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { ChatItem } from "@/components/ChatItem";
import { chats } from "@/data/mockData";
import { Search } from "lucide-react";

export default function ChatPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredChats = chats.filter(chat =>
    chat.user.name.toLowerCase().includes(searchQuery.toLowerCase())
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
          {filteredChats.length > 0 ? (
            filteredChats.map((chat, index) => (
              <div
                key={chat.id}
                className="animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <ChatItem
                  chat={chat}
                  onClick={() => console.log("Open chat:", chat.id)}
                />
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Ingen samtaler fundet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
