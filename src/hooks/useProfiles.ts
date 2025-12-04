import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, calculateAge } from "@/contexts/AuthContext";

export interface ProfileWithInterests {
  id: string;
  user_id: string;
  name: string;
  username: string | null;
  age: number | null;
  birthday: string | null;
  gender: string | null;
  city: string | null;
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
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("*")
        .neq("user_id", user.id);

      if (!profilesData) return;

      const { data: allInterests } = await supabase
        .from("user_interests")
        .select("user_id, interests(name)");

      const { data: friendships } = await supabase
        .from("friendships")
        .select("*")
        .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`);

      const mappedProfiles = profilesData.map((profile: any) => {
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

        const age = profile.birthday ? calculateAge(profile.birthday) : profile.age;

        return {
          id: profile.id,
          user_id: profile.user_id,
          name: profile.name,
          username: profile.username || null,
          age,
          birthday: profile.birthday || null,
          gender: profile.gender,
          city: profile.city || null,
          bio: profile.bio,
          avatar_url: profile.avatar_url,
          is_online: profile.is_online || false,
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
    if (!user) return { error: new Error("Not authenticated") as any };

    const { error } = await supabase.from("friendships").insert({
      requester_id: user.id,
      addressee_id: addresseeId,
      status: "pending",
    });

    if (!error) {
      await fetchProfiles();
    }

    return { error };
  };

  const acceptFriendRequest = async (requesterId: string) => {
    if (!user) return { error: new Error("Not authenticated") as any };

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

  const rejectFriendRequest = async (requesterId: string) => {
    if (!user) return { error: new Error("Not authenticated") as any };

    const { error } = await supabase
      .from("friendships")
      .delete()
      .eq("requester_id", requesterId)
      .eq("addressee_id", user.id);

    if (!error) {
      await fetchProfiles();
    }

    return { error };
  };

  const removeFriend = async (friendUserId: string) => {
    if (!user) return { error: new Error("Not authenticated") as any };

    const { error } = await supabase
      .from("friendships")
      .delete()
      .or(`and(requester_id.eq.${user.id},addressee_id.eq.${friendUserId}),and(requester_id.eq.${friendUserId},addressee_id.eq.${user.id})`);

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
    rejectFriendRequest,
    removeFriend,
  };
}
