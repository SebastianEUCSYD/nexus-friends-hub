import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Avatar } from "@/components/Avatar";
import { Button } from "@/components/ui/button";
import { useProfiles } from "@/hooks/useProfiles";
import { ArrowLeft, Check, X, UserPlus, MapPin } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";

export default function FriendRequestsPage() {
  const navigate = useNavigate();
  const { profiles, acceptFriendRequest, rejectFriendRequest } = useProfiles();
  const [loadingIds, setLoadingIds] = useState<string[]>([]);

  const pendingRequests = profiles.filter(
    (p) => p.friendshipStatus === "requested"
  );

  const handleAccept = async (profile: typeof profiles[0]) => {
    setLoadingIds((prev) => [...prev, profile.user_id]);
    const { error } = await acceptFriendRequest(profile.user_id);
    if (error) {
      toast({
        title: "Noget gik galt",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Venneanmodning accepteret! 🎉",
        description: `Du er nu venner med ${profile.name}`,
      });
    }
    setLoadingIds((prev) => prev.filter((id) => id !== profile.user_id));
  };

  const handleReject = async (profile: typeof profiles[0]) => {
    setLoadingIds((prev) => [...prev, profile.user_id]);
    const { error } = await rejectFriendRequest(profile.user_id);
    if (error) {
      toast({
        title: "Noget gik galt",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "Venneanmodning afvist" });
    }
    setLoadingIds((prev) => prev.filter((id) => id !== profile.user_id));
  };

  return (
    <div className="min-h-screen pb-24">
      <PageHeader
        title="Venneanmodninger"
        leftAction={
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
        }
      />

      <div className="px-4 space-y-4">
        {pendingRequests.length > 0 ? (
          pendingRequests.map((profile, index) => (
            <div
              key={profile.id}
              className="bg-card rounded-2xl p-4 shadow-card animate-slide-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <button
                onClick={() => navigate(`/user/${profile.user_id}`)}
                className="w-full flex items-center gap-4 mb-4"
              >
                <Avatar
                  src={profile.avatar_url || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"}
                  alt={profile.name}
                  size="lg"
                  isOnline={profile.is_online}
                />
                <div className="flex-1 text-left">
                  <h3 className="font-semibold text-foreground">
                    {profile.name}, {profile.age}
                  </h3>
                  {profile.city && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {profile.city}
                    </div>
                  )}
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {profile.interests.slice(0, 3).join(", ")}
                  </p>
                </div>
              </button>
              
              <div className="flex gap-3">
                <Button
                  variant="gradient"
                  className="flex-1"
                  onClick={() => handleAccept(profile)}
                  disabled={loadingIds.includes(profile.user_id)}
                >
                  <Check className="h-4 w-4" />
                  Acceptér
                </Button>
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => handleReject(profile)}
                  disabled={loadingIds.includes(profile.user_id)}
                >
                  <X className="h-4 w-4" />
                  Afvis
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <div className="h-16 w-16 mx-auto rounded-full bg-secondary flex items-center justify-center mb-4">
              <UserPlus className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">
              Ingen ventende venneanmodninger
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
