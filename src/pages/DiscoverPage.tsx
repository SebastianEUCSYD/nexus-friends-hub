import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { UserCard } from "@/components/UserCard";
import { InterestBadge } from "@/components/InterestBadge";
import { useProfiles } from "@/hooks/useProfiles";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Users } from "lucide-react";

interface Interest {
  id: string;
  name: string;
}

export default function DiscoverPage() {
  const navigate = useNavigate();
  const { userInterests } = useAuth();
  const { profiles, loading, sendFriendRequest } = useProfiles();
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [allInterests, setAllInterests] = useState<Interest[]>([]);

  useEffect(() => {
    const fetchInterests = async () => {
      const { data } = await supabase.from("interests").select("*");
      if (data) setAllInterests(data);
    };
    fetchInterests();
  }, []);

  const toggleInterest = (interestName: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interestName)
        ? prev.filter((i) => i !== interestName)
        : [...prev, interestName]
    );
  };

  const filteredProfiles = profiles.filter((profile) => {
    // Don't show friends
    if (profile.isFriend) return false;
    // Filter by selected interests
    if (selectedInterests.length === 0) return true;
    return selectedInterests.some((interest) =>
      profile.interests.includes(interest)
    );
  });

  const handleAddFriend = async (userId: string) => {
    const { error } = await sendFriendRequest(userId);
    const profile = profiles.find((p) => p.user_id === userId);
    if (error) {
      toast({
        title: "Noget gik galt",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Venneanmodning sendt! 🎉",
        description: `Du har sendt en anmodning til ${profile?.name}`,
      });
    }
  };

  return (
    <div className="min-h-screen pb-24">
      <PageHeader
        title="Opdag"
        subtitle="Find nye venner med fælles interesser"
      />

      <div className="px-4 space-y-6">
        {/* Interest Filter */}
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground mb-3">
            Filtrer efter interesser
          </h2>
          <div className="flex flex-wrap gap-2">
            {allInterests.map((interest) => (
              <InterestBadge
                key={interest.id}
                interest={interest.name}
                isSelected={selectedInterests.includes(interest.name)}
                onClick={() => toggleInterest(interest.name)}
                size="sm"
              />
            ))}
          </div>
        </div>

        {/* Users Grid */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-muted-foreground">
            {filteredProfiles.length}{" "}
            {filteredProfiles.length === 1 ? "person" : "personer"} fundet
          </h2>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-48 bg-card rounded-3xl animate-pulse"
                />
              ))}
            </div>
          ) : filteredProfiles.length > 0 ? (
            <div className="grid gap-4">
              {filteredProfiles.map((profile, index) => (
                <div
                  key={profile.id}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <UserCard
                    user={{
                      id: profile.id,
                      name: profile.name,
                      age: profile.age || 0,
                      gender: profile.gender || "",
                      avatar: profile.avatar_url || "",
                      interests: profile.interests,
                      bio: profile.bio || "",
                      isOnline: profile.is_online,
                      isFriend: profile.isFriend,
                    }}
                    onClick={() => navigate(`/user/${profile.user_id}`)}
                    onAddFriend={
                      profile.friendshipStatus === "none"
                        ? () => handleAddFriend(profile.user_id)
                        : undefined
                    }
                    friendshipStatus={profile.friendshipStatus}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="h-16 w-16 mx-auto rounded-full bg-secondary flex items-center justify-center mb-4">
                <Users className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">
                Ingen nye venner fundet med disse interesser
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
