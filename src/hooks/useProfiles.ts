import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface ProfileWithInterests {
  id: string;
  user_id: string;
  name: string;
  age: number | null;
  gender: string | null;
  bio: string | null;
  avatar_url: string | null;
  is_online: boolean;
  interests: string[];
  isFriend: boolean;
  friendshipStatus: "none" | "pending" | "accepted" | "requested";
}

export function useProfiles() {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<ProfileWithInterests[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProfiles = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Fetch all profiles except current user
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("*")
        .neq("user_id", user.id);

      if (!profilesData) return;

      // Fetch all user interests
      const { data: allInterests } = await supabase
        .from("user_interests")
        .select("user_id, interests(name)");

      // Fetch friendships
      const { data: friendships } = await supabase
        .from("friendships")
        .select("*")
        .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`);

      // Map profiles with interests and friendship status
      const mappedProfiles = profilesData.map((profile) => {
        const userInterests = allInterests
          ?.filter((ui: any) => ui.user_id === profile.user_id)
          .map((ui: any) => ui.interests?.name)
          .filter(Boolean) || [];

        const friendship = friendships?.find(
          (f) =>
            (f.requester_id === user.id && f.addressee_id === profile.user_id) ||
            (f.addressee_id === user.id && f.requester_id === profile.user_id)
        );

        let friendshipStatus: "none" | "pending" | "accepted" | "requested" = "none";
        if (friendship) {
          if (friendship.status === "accepted") {
            friendshipStatus = "accepted";
          } else if (friendship.requester_id === user.id) {
            friendshipStatus = "pending";
          } else {
            friendshipStatus = "requested";
          }
        }

        return {
          ...profile,
          interests: userInterests,
          isFriend: friendshipStatus === "accepted",
          friendshipStatus,
        };
      });

      setProfiles(mappedProfiles);
    } catch (error) {
      console.error("Error fetching profiles:", error);
    } finally {
      setLoading(false);
    }
  };

  const sendFriendRequest = async (addresseeId: string) => {
    if (!user) return;

    const { error } = await supabase.from("friendships").insert({
      requester_id: user.id,
      addressee_id: addresseeId,
      status: "pending",
    });

    if (!error) {
      setProfiles((prev) =>
        prev.map((p) =>
          p.user_id === addresseeId
            ? { ...p, friendshipStatus: "pending" as const }
            : p
        )
      );
    }

    return { error };
  };

  const acceptFriendRequest = async (requesterId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from("friendships")
      .update({ status: "accepted" })
      .eq("requester_id", requesterId)
      .eq("addressee_id", user.id);

    if (!error) {
      await fetchProfiles();
    }

    return { error };
  };

  useEffect(() => {
    fetchProfiles();
  }, [user]);

  return {
    profiles,
    loading,
    fetchProfiles,
    sendFriendRequest,
    acceptFriendRequest,
  };
}
