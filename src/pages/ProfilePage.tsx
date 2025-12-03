import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Avatar } from "@/components/Avatar";
import { InterestBadge } from "@/components/InterestBadge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Settings, Edit2, Camera, LogOut } from "lucide-react";

export default function ProfilePage() {
  const navigate = useNavigate();
  const { profile, userInterests, signOut, refreshProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(profile?.name || "");
  const [bio, setBio] = useState(profile?.bio || "");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!profile) return;
    setLoading(true);

    const { error } = await supabase
      .from("profiles")
      .update({ name: name.trim(), bio: bio.trim() || null })
      .eq("user_id", profile.user_id);

    if (error) {
      toast({
        title: "Noget gik galt",
        description: error.message,
        variant: "destructive",
      });
    } else {
      await refreshProfile();
      toast({ title: "Profil opdateret! ✨" });
      setIsEditing(false);
    }
    setLoading(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Indlæser...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      <PageHeader title="Profil">
        <Button variant="ghost" size="icon" onClick={handleSignOut}>
          <LogOut className="h-5 w-5" />
        </Button>
      </PageHeader>

      <div className="px-4 space-y-6">
        {/* Profile Header */}
        <div className="bg-card rounded-3xl p-6 shadow-card text-center">
          <div className="relative inline-block mb-4">
            <Avatar
              src={profile.avatar_url || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"}
              alt={profile.name}
              size="xl"
              isOnline
            />
            <button className="absolute bottom-0 right-0 h-10 w-10 rounded-full gradient-primary flex items-center justify-center shadow-soft">
              <Camera className="h-5 w-5 text-primary-foreground" />
            </button>
          </div>

          {isEditing ? (
            <div className="space-y-3 text-left">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Dit navn"
                className="w-full h-12 px-4 rounded-2xl bg-secondary text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Din bio..."
                rows={2}
                className="w-full px-4 py-3 rounded-2xl bg-secondary text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
              />
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-foreground mb-1">
                {profile.name}, {profile.age}
              </h2>
              <p className="text-muted-foreground mb-4">{profile.gender}</p>
              <p className="text-foreground">{profile.bio || "Ingen bio endnu"}</p>
            </>
          )}

          <Button
            variant={isEditing ? "gradient" : "secondary"}
            className="mt-4"
            onClick={isEditing ? handleSave : () => {
              setName(profile.name);
              setBio(profile.bio || "");
              setIsEditing(true);
            }}
            disabled={loading}
          >
            <Edit2 className="h-4 w-4" />
            {loading ? "Gemmer..." : isEditing ? "Gem ændringer" : "Rediger profil"}
          </Button>

          {isEditing && (
            <Button
              variant="ghost"
              className="mt-2 ml-2"
              onClick={() => setIsEditing(false)}
            >
              Annuller
            </Button>
          )}
        </div>

        {/* Interests */}
        <div className="bg-card rounded-3xl p-6 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg text-foreground">Mine interesser</h3>
            <span className="text-sm text-muted-foreground">
              {userInterests.length} valgt
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {userInterests.length > 0 ? (
              userInterests.map((interest) => (
                <InterestBadge
                  key={interest.id}
                  interest={interest.name}
                  isSelected
                />
              ))
            ) : (
              <p className="text-muted-foreground text-sm">
                Ingen interesser valgt
              </p>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-card rounded-2xl p-4 shadow-soft text-center">
            <p className="text-2xl font-bold text-primary">
              {userInterests.length}
            </p>
            <p className="text-xs text-muted-foreground">Interesser</p>
          </div>
          <div className="bg-card rounded-2xl p-4 shadow-soft text-center">
            <p className="text-2xl font-bold text-primary">0</p>
            <p className="text-xs text-muted-foreground">Venner</p>
          </div>
        </div>
      </div>
    </div>
  );
}
