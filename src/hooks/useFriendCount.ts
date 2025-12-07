import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useFriendCount() {
  const { user } = useAuth();
  const [friendCount, setFriendCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchFriendCount = useCallback(async () => {
    if (!user) {
      setFriendCount(0);
      setLoading(false);
      return;
    }

    try {
      // Count friendships where user is requester
      const { count: requesterCount } = await supabase
        .from("friendships")
        .select("*", { count: "exact", head: true })
        .eq("status", "accepted")
        .eq("requester_id", user.id);

      // Count friendships where user is addressee
      const { count: addresseeCount } = await supabase
        .from("friendships")
        .select("*", { count: "exact", head: true })
        .eq("status", "accepted")
        .eq("addressee_id", user.id);

      const total = (requesterCount || 0) + (addresseeCount || 0);
      setFriendCount(total);
    } catch (error) {
      console.error("Error fetching friend count:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchFriendCount();

    if (!user) return;

    // Subscribe to friendship changes with a unique channel name
    const channel = supabase
      .channel(`friendships-count-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "friendships",
        },
        () => {
          fetchFriendCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchFriendCount]);

  return { friendCount, loading, refetch: fetchFriendCount };
}
