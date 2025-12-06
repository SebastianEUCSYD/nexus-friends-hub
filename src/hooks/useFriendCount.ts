import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useFriendCount() {
  const { user } = useAuth();
  const [friendCount, setFriendCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchFriendCount = async () => {
    if (!user) {
      setFriendCount(0);
      setLoading(false);
      return;
    }

    const { count } = await supabase
      .from("friendships")
      .select("*", { count: "exact", head: true })
      .eq("status", "accepted")
      .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`);

    setFriendCount(count || 0);
    setLoading(false);
  };

  useEffect(() => {
    fetchFriendCount();

    // Subscribe to friendship changes
    const channel = supabase
      .channel("friendships-count")
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
  }, [user]);

  return { friendCount, loading, refetch: fetchFriendCount };
}
