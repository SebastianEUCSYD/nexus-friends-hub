import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { UserCard } from "@/components/UserCard";
import { InterestBadge } from "@/components/InterestBadge";
import { useProfiles } from "@/hooks/useProfiles";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Users, Search, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  const [shuffleSeed, setShuffleSeed] = useState(0);

  // Shuffle function using seed for consistent randomization
  const shuffleArray = <T,>(array: T[], seed: number): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor((Math.sin(seed + i) + 1) * 0.5 * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const handleRefreshSuggestions = () => {
    setShuffleSeed(prev => prev + 1);
  };

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

  const isSearching = searchQuery.length > 0 || selectedInterests.length > 0;

  // Calculate relevance score for a profile
  const getRelevanceScore = (profile: typeof profiles[0]) => {
    let score = 0;
    
    // Same city = high priority
    if (currentProfile?.city && profile.city?.toLowerCase() === currentProfile.city.toLowerCase()) {
      score += 100;
    }
    
    // Shared interests (userInterests contains interest names as strings)
    const userInterestNames = userInterests.map((i) => (typeof i === 'string' ? i : i.name));
    const sharedInterests = userInterestNames.filter((interest) =>
      profile.interests.includes(interest)
    );
    score += sharedInterests.length * 20;
    
    // Online users get slight boost
    if (profile.is_online) score += 5;
    
    return score;
  };

  const filteredProfiles = profiles.filter((profile) => {
    // Don't show friends (already accepted)
    if (profile.friendshipStatus === "accepted") return false;
    
    // When searching, filter by name or username
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
    
    return true;
  });

  // Sort by relevance score (highest first), then shuffle with seed for variety
  const sortedProfiles = [...filteredProfiles].sort((a, b) => {
    return getRelevanceScore(b) - getRelevanceScore(a);
  });

  // When not searching, shuffle the profiles to show different ones each refresh
  const shuffledForDisplay = isSearching ? sortedProfiles : shuffleArray(sortedProfiles, shuffleSeed);

  // Only show top 10 when not searching
  const displayedProfiles = isSearching ? sortedProfiles : shuffledForDisplay.slice(0, 10);

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
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-muted-foreground">
              {isSearching 
                ? `${displayedProfiles.length} ${displayedProfiles.length === 1 ? "person" : "personer"} fundet`
                : `Top ${displayedProfiles.length} forslag til dig`
              }
            </h2>
            {!isSearching && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefreshSuggestions}
                className="text-muted-foreground hover:text-foreground"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Opdater forslag
              </Button>
            )}
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-48 bg-card rounded-3xl animate-pulse"
                />
              ))}
            </div>
          ) : displayedProfiles.length > 0 ? (
            <div className="grid gap-4">
              {displayedProfiles.map((profile, index) => (
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