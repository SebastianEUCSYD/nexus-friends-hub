import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

export interface ActivityInvitation {
  id: string;
  sender_id: string;
  receiver_id: string;
  activity_title: string;
  activity_icon: string;
  is_read: boolean;
  created_at: string;
  sender_name?: string;
  sender_avatar?: string | null;
}

export function useActivityInvitations() {
  const { user } = useAuth();
  const [invitations, setInvitations] = useState<ActivityInvitation[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchInvitations = async () => {
    if (!user) return;

    const { data } = await supabase
      .from("activity_invitations")
      .select("*")
      .eq("receiver_id", user.id)
      .order("created_at", { ascending: false });

    if (data) {
      // Get sender profiles
      const senderIds = [...new Set(data.map((i) => i.sender_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, name, avatar_url")
        .in("user_id", senderIds);

      const profileMap = new Map(
        profiles?.map((p) => [p.user_id, p]) || []
      );

      const enrichedInvitations = data.map((inv) => ({
        ...inv,
        sender_name: profileMap.get(inv.sender_id)?.name || "Ukendt",
        sender_avatar: profileMap.get(inv.sender_id)?.avatar_url || null,
      }));

      setInvitations(enrichedInvitations);
      setUnreadCount(enrichedInvitations.filter((i) => !i.is_read).length);
    }
    setLoading(false);
  };

  const sendInvitations = async (
    receiverIds: string[],
    activityTitle: string,
    activityIcon: string
  ) => {
    if (!user) return { error: new Error("Not authenticated") };

    const invites = receiverIds.map((receiverId) => ({
      sender_id: user.id,
      receiver_id: receiverId,
      activity_title: activityTitle,
      activity_icon: activityIcon,
    }));

    const { error } = await supabase.from("activity_invitations").insert(invites);
    return { error };
  };

  const markAsRead = async (invitationId: string) => {
    await supabase
      .from("activity_invitations")
      .update({ is_read: true })
      .eq("id", invitationId);
    
    setInvitations((prev) =>
      prev.map((i) => (i.id === invitationId ? { ...i, is_read: true } : i))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const markAllAsRead = async () => {
    if (!user) return;
    
    await supabase
      .from("activity_invitations")
      .update({ is_read: true })
      .eq("receiver_id", user.id)
      .eq("is_read", false);
    
    setInvitations((prev) => prev.map((i) => ({ ...i, is_read: true })));
    setUnreadCount(0);
  };

  useEffect(() => {
    fetchInvitations();

    if (!user) return;

    // Subscribe to new invitations
    const channel = supabase
      .channel("activity-invitations")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "activity_invitations",
        },
        async (payload) => {
          const newInv = payload.new as ActivityInvitation;
          
          // Only show notification if it's for us
          if (newInv.receiver_id === user.id) {
            // Get sender profile
            const { data: profile } = await supabase
              .from("profiles")
              .select("name, avatar_url")
              .eq("user_id", newInv.sender_id)
              .maybeSingle();

            const enrichedInv = {
              ...newInv,
              sender_name: profile?.name || "Nogen",
              sender_avatar: profile?.avatar_url || null,
            };

            setInvitations((prev) => [enrichedInv, ...prev]);
            setUnreadCount((prev) => prev + 1);

            toast({
              title: `${newInv.activity_icon} Ny aktivitetsinvitation!`,
              description: `${enrichedInv.sender_name} har inviteret dig til "${newInv.activity_title}"`,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    invitations,
    unreadCount,
    loading,
    sendInvitations,
    markAsRead,
    markAllAsRead,
    refetch: fetchInvitations,
  };
}
