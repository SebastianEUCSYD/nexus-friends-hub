import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface ChatPreview {
  id: string;
  friendId: string;
  friendName: string;
  friendAvatar: string | null;
  isOnline: boolean;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

export function useChats() {
  const { user } = useAuth();
  const [chats, setChats] = useState<ChatPreview[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchChats = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Get accepted friendships
      const { data: friendships } = await supabase
        .from("friendships")
        .select("*")
        .eq("status", "accepted")
        .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`);

      if (!friendships || friendships.length === 0) {
        setChats([]);
        setLoading(false);
        return;
      }

      // Get friend IDs
      const friendIds = friendships.map((f) =>
        f.requester_id === user.id ? f.addressee_id : f.requester_id
      );

      // Get friend profiles
      const { data: profiles } = await supabase
        .from("profiles")
        .select("*")
        .in("user_id", friendIds);

      // Get messages
      const { data: messages } = await supabase
        .from("messages")
        .select("*")
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order("created_at", { ascending: false });

      // Build chat previews
      const chatPreviews = profiles?.map((profile) => {
        const relevantMessages = messages?.filter(
          (m) =>
            (m.sender_id === user.id && m.receiver_id === profile.user_id) ||
            (m.receiver_id === user.id && m.sender_id === profile.user_id)
        );

        const lastMsg = relevantMessages?.[0];
        const unreadCount = relevantMessages?.filter(
          (m) => m.receiver_id === user.id && !m.is_read
        ).length || 0;

        return {
          id: profile.user_id,
          friendId: profile.user_id,
          friendName: profile.name,
          friendAvatar: profile.avatar_url,
          isOnline: profile.is_online,
          lastMessage: lastMsg?.content || "Start en samtale",
          lastMessageTime: lastMsg
            ? formatTime(new Date(lastMsg.created_at))
            : "",
          unreadCount,
        };
      }) || [];

      // Sort by last message time
      chatPreviews.sort((a, b) => {
        if (!a.lastMessageTime) return 1;
        if (!b.lastMessageTime) return -1;
        return 0;
      });

      setChats(chatPreviews);
    } catch (error) {
      console.error("Error fetching chats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChats();

    // Subscribe to new messages
    const channel = supabase
      .channel("messages-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
        },
        () => {
          fetchChats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return { chats, loading, fetchChats };
}

function formatTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Nu";
  if (minutes < 60) return `${minutes} min`;
  if (hours < 24) return `${hours} time${hours > 1 ? "r" : ""}`;
  return `${days} dag${days > 1 ? "e" : ""}`;
}
