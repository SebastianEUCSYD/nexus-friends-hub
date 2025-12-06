import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Avatar } from "@/components/Avatar";
import { InterestBadge } from "@/components/InterestBadge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useProfiles } from "@/hooks/useProfiles";
import { ArrowLeft, UserPlus, Check, MessageCircle, Clock, UserMinus, MapPin } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function UserProfilePage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { userInterests } = useAuth();
  const { profiles, sendFriendRequest, acceptFriendRequest, rejectFriendRequest, removeFriend } = useProfiles();
  const [profile, setProfile] = useState(profiles.find((p) => p.user_id === userId));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setProfile(profiles.find((p) => p.user_id === userId));
  }, [profiles, userId]);

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Bruger ikke fundet</p>
      </div>
    );
  }

  const myInterestNames = userInterests.map((i) => i.name);
  const sharedInterests = profile.interests.filter((i) =>
    myInterestNames.includes(i)
  );

  const handleAddFriend = async () => {
    setLoading(true);
    const { error } = await sendFriendRequest(profile.user_id);
    if (error) {
      toast({
        title: "Noget gik galt",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Venneanmodning sendt! 🎉",
        description: `Du har sendt en anmodning til ${profile.name}`,
      });
    }
    setLoading(false);
  };

  const handleAcceptFriend = async () => {
    setLoading(true);
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
    setLoading(false);
  };

  const handleRejectFriend = async () => {
    setLoading(true);
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
    setLoading(false);
  };

  const handleRemoveFriend = async () => {
    setLoading(true);
    const { error } = await removeFriend(profile.user_id);
    if (error) {
      toast({
        title: "Noget gik galt",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: `${profile.name} er fjernet som ven` });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen pb-24">
      <PageHeader
        title=""
        leftAction={
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
        }
      />

      <div className="px-4 space-y-6">
        {/* Profile Header */}
        <div className="bg-card rounded-3xl p-6 shadow-card text-center animate-fade-in">
          <Avatar
            src={profile.avatar_url || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"}
            alt={profile.name}
            size="xl"
            isOnline={profile.is_online}
            className="mx-auto mb-4"
          />

          <h2 className="text-2xl font-bold text-foreground mb-1">
            {profile.name}, {profile.age}
          </h2>
          {profile.username && (
            <p className="text-sm text-muted-foreground mb-1">@{profile.username}</p>
          )}
          <p className="text-muted-foreground mb-2">{profile.gender}</p>
          
          {profile.city && (
            <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-2">
              <MapPin className="h-4 w-4" />
              {profile.city}
            </div>
          )}
          
          <span
            className={`inline-flex items-center gap-1.5 text-sm ${
              profile.is_online ? "text-online" : "text-muted-foreground"
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                profile.is_online ? "bg-online" : "bg-offline"
              }`}
            />
            {profile.is_online ? "Online" : "Offline"}
          </span>
          <p className="text-foreground mt-4">{profile.bio || "Ingen bio endnu"}</p>

          <div className="flex gap-3 mt-6">
            {profile.friendshipStatus === "accepted" ? (
              <>
                <Button
                  variant="gradient"
                  className="flex-1"
                  onClick={() => navigate(`/conversation/${profile.user_id}`)}
                >
                  <MessageCircle className="h-4 w-4" />
                  Send besked
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleRemoveFriend}
                  disabled={loading}
                >
                  <UserMinus className="h-4 w-4" />
                </Button>
              </>
            ) : profile.friendshipStatus === "pending" ? (
              <Button variant="secondary" className="flex-1" disabled>
                <Clock className="h-4 w-4" />
                Anmodning sendt
              </Button>
            ) : profile.friendshipStatus === "requested" ? (
              <>
                <Button
                  variant="gradient"
                  className="flex-1"
                  onClick={handleAcceptFriend}
                  disabled={loading}
                >
                  <Check className="h-4 w-4" />
                  Acceptér
                </Button>
                <Button
                  variant="secondary"
                  onClick={handleRejectFriend}
                  disabled={loading}
                >
                  Afvis
                </Button>
              </>
            ) : (
              <Button
                variant="gradient"
                className="flex-1"
                onClick={handleAddFriend}
                disabled={loading}
              >
                <UserPlus className="h-4 w-4" />
                Tilføj ven
              </Button>
            )}
          </div>
        </div>

        {/* Shared Interests */}
        {sharedInterests.length > 0 && (
          <div className="bg-card rounded-3xl p-6 shadow-card animate-slide-up">
            <h3 className="font-bold text-lg text-foreground mb-4">
              🎯 {sharedInterests.length} fælles interesser
            </h3>
            <div className="flex flex-wrap gap-2">
              {sharedInterests.map((interest) => (
                <InterestBadge key={interest} interest={interest} isShared />
              ))}
            </div>
          </div>
        )}

        {/* All Interests */}
        <div
          className="bg-card rounded-3xl p-6 shadow-card animate-slide-up"
          style={{ animationDelay: "100ms" }}
        >
          <h3 className="font-bold text-lg text-foreground mb-4">
            Alle interesser
          </h3>
          <div className="flex flex-wrap gap-2">
            {profile.interests.map((interest) => (
              <InterestBadge
                key={interest}
                interest={interest}
                isShared={myInterestNames.includes(interest)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
