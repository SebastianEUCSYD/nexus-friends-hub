import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { UserCard } from "@/components/UserCard";
import { InterestBadge } from "@/components/InterestBadge";
import { useProfiles } from "@/hooks/useProfiles";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Users, Search } from "lucide-react";

interface Interest {
  id: string;
  name: string;
}

export default function DiscoverPage() {
  const navigate = useNavigate();
  const { profile: currentProfile, userInterests } = useAuth();
  const { profiles, loading, sendFriendRequest } = useProfiles();
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [allInterests, setAllInterests] = useState<Interest[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

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
    // Don't show friends (already accepted)
    if (profile.friendshipStatus === "accepted") return false;
    
    // Search by name or username
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesName = profile.name.toLowerCase().includes(query);
      const matchesUsername = profile.username?.toLowerCase().includes(query);
      if (!matchesName && !matchesUsername) return false;
    }
    
    // Filter by selected interests
    if (selectedInterests.length > 0) {
      const hasMatchingInterest = selectedInterests.some((interest) =>
        profile.interests.includes(interest)
      );
      if (!hasMatchingInterest) return false;
    }
    
    // Filter by city (same city as current user)
    if (currentProfile?.city && profile.city) {
      // Show people from the same city first, but don't exclude others if no city filter
    }
    
    return true;
  });

  // Sort by same city first
  const sortedProfiles = [...filteredProfiles].sort((a, b) => {
    if (currentProfile?.city) {
      const aInCity = a.city?.toLowerCase() === currentProfile.city.toLowerCase();
      const bInCity = b.city?.toLowerCase() === currentProfile.city.toLowerCase();
      if (aInCity && !bInCity) return -1;
      if (!aInCity && bInCity) return 1;
    }
    return 0;
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
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Søg efter navn eller @brugernavn..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12 pl-12 pr-4 rounded-2xl bg-secondary text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          />
        </div>

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
            {sortedProfiles.length}{" "}
            {sortedProfiles.length === 1 ? "person" : "personer"} fundet
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
          ) : sortedProfiles.length > 0 ? (
            <div className="grid gap-4">
              {sortedProfiles.map((profile, index) => (
                <div
                  key={profile.id}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <UserCard
                    user={{
                      id: profile.id,
                      name: profile.name,
                      username: profile.username,
                      age: profile.age || 0,
                      city: profile.city,
                      avatar: profile.avatar_url || "",
                      interests: profile.interests,
                      bio: profile.bio || "",
                      isOnline: profile.is_online,
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
                {searchQuery
                  ? "Ingen personer fundet med det søgeord"
                  : "Ingen nye venner fundet med disse interesser"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}