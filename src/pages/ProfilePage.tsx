import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Avatar } from "@/components/Avatar";
import { InterestBadge } from "@/components/InterestBadge";
import { Button } from "@/components/ui/button";
import { useAuth, calculateAge } from "@/contexts/AuthContext";
import { useFriendCount } from "@/hooks/useFriendCount";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Edit2, Camera, LogOut, MapPin, AtSign, Calendar, X, Check } from "lucide-react";

interface Interest {
  id: string;
  name: string;
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, profile, userInterests, signOut, refreshProfile } = useAuth();
  const { friendCount } = useFriendCount();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [birthday, setBirthday] = useState("");
  const [city, setCity] = useState("");
  const [gender, setGender] = useState("");
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [allInterests, setAllInterests] = useState<Interest[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch all interests
  useEffect(() => {
    const fetchInterests = async () => {
      const { data } = await supabase.from("interests").select("*");
      if (data) setAllInterests(data);
    };
    fetchInterests();
  }, []);

  // Check username availability
  useEffect(() => {
    const checkUsername = async () => {
      if (!username || username.length < 3 || username === profile?.username) {
        setUsernameAvailable(username === profile?.username ? true : null);
        return;
      }
      const { data } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", username.toLowerCase())
        .maybeSingle();
      setUsernameAvailable(!data);
    };
    const timer = setTimeout(checkUsername, 500);
    return () => clearTimeout(timer);
  }, [username, profile?.username]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const startEditing = () => {
    if (!profile) return;
    setName(profile.name);
    setUsername(profile.username || "");
    setBirthday(profile.birthday || "");
    setCity(profile.city || "");
    setGender(profile.gender || "");
    setBio(profile.bio || "");
    setAvatarPreview(null);
    setAvatarFile(null);
    setSelectedInterests(userInterests.map(i => i.id));
    setIsEditing(true);
  };

  const toggleInterest = (interestId: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interestId)
        ? prev.filter((id) => id !== interestId)
        : [...prev, interestId]
    );
  };

  const handleSave = async () => {
    if (!profile || !user) return;
    
    if (!name.trim()) {
      toast({ title: "Navn er påkrævet", variant: "destructive" });
      return;
    }
    if (username && username.length < 3) {
      toast({ title: "Brugernavn skal være mindst 3 tegn", variant: "destructive" });
      return;
    }
    if (usernameAvailable === false) {
      toast({ title: "Brugernavnet er allerede taget", variant: "destructive" });
      return;
    }
    if (selectedInterests.length < 3) {
      toast({ title: "Vælg mindst 3 interesser", variant: "destructive" });
      return;
    }

    setLoading(true);

    try {
      let avatarUrl = profile.avatar_url;

      // Upload new avatar if selected
      if (avatarFile) {
        const fileExt = avatarFile.name.split(".").pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(fileName, avatarFile);

        if (uploadError) throw uploadError;

        const { data: publicUrl } = supabase.storage
          .from("avatars")
          .getPublicUrl(fileName);
        
        avatarUrl = publicUrl.publicUrl;
      }

      // Update profile
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          name: name.trim(),
          username: username.toLowerCase().trim() || null,
          birthday: birthday || null,
          city: city.trim() || null,
          gender: gender || null,
          bio: bio.trim() || null,
          avatar_url: avatarUrl,
        })
        .eq("user_id", user.id);

      if (profileError) throw profileError;

      // Update interests - delete old ones and insert new ones
      await supabase.from("user_interests").delete().eq("user_id", user.id);
      
      if (selectedInterests.length > 0) {
        const interestInserts = selectedInterests.map((interestId) => ({
          user_id: user.id,
          interest_id: interestId,
        }));
        const { error: interestsError } = await supabase
          .from("user_interests")
          .insert(interestInserts);
        if (interestsError) throw interestsError;
      }

      await refreshProfile();
      toast({ title: "Profil opdateret! ✨" });
      setIsEditing(false);
    } catch (error: any) {
      toast({
        title: "Noget gik galt",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
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

  const displayAge = profile.birthday ? calculateAge(profile.birthday) : profile.age;

  return (
    <div className="min-h-screen pb-24">
      <PageHeader title="Profil">
        <Button variant="ghost" size="icon" onClick={handleSignOut}>
          <LogOut className="h-5 w-5" />
        </Button>
      </PageHeader>

      <div className="px-4 space-y-6">
        {/* Profile Header */}
        <div className="bg-card rounded-3xl p-6 shadow-card">
          <div className="flex flex-col items-center mb-4">
            <div className="relative inline-block mb-4">
              {isEditing ? (
                <>
                  <img
                    src={avatarPreview || profile.avatar_url || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"}
                    alt={profile.name}
                    className="h-24 w-24 rounded-full object-cover ring-4 ring-primary shadow-glow"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 h-10 w-10 rounded-full gradient-primary flex items-center justify-center shadow-soft"
                  >
                    <Camera className="h-5 w-5 text-primary-foreground" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </>
              ) : (
                <Avatar
                  src={profile.avatar_url || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"}
                  alt={profile.name}
                  size="xl"
                  isOnline
                />
              )}
            </div>

            {isEditing ? (
              <div className="w-full space-y-3">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Dit navn"
                  className="w-full h-12 px-4 rounded-2xl bg-secondary text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                
                <div className="relative">
                  <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ""))}
                    placeholder="Brugernavn"
                    className={`w-full h-12 pl-12 pr-4 rounded-2xl bg-secondary text-foreground focus:outline-none focus:ring-2 ${
                      usernameAvailable === true ? "ring-2 ring-green-500/50" : 
                      usernameAvailable === false ? "ring-2 ring-red-500/50" : 
                      ""
                    }`}
                  />
                </div>

                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <input
                    type="date"
                    value={birthday}
                    onChange={(e) => setBirthday(e.target.value)}
                    max={new Date().toISOString().split("T")[0]}
                    className="w-full h-12 pl-12 pr-4 rounded-2xl bg-secondary text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Din by"
                    className="w-full h-12 pl-12 pr-4 rounded-2xl bg-secondary text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">Køn</label>
                  <div className="flex gap-2">
                    {["Mand", "Kvinde", "Andet"].map((g) => (
                      <button
                        key={g}
                        onClick={() => setGender(g)}
                        className={`flex-1 h-10 rounded-xl font-medium transition-all text-sm ${
                          gender === g
                            ? "gradient-primary text-primary-foreground"
                            : "bg-secondary text-foreground hover:bg-secondary/80"
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Din bio..."
                  rows={2}
                  maxLength={200}
                  className="w-full px-4 py-3 rounded-2xl bg-secondary text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                />
              </div>
            ) : (
              <div className="text-center">
                <h2 className="text-2xl font-bold text-foreground mb-1">
                  {profile.name}{displayAge ? `, ${displayAge}` : ""}
                </h2>
                {profile.username && (
                  <p className="text-primary font-medium">@{profile.username}</p>
                )}
                <p className="text-muted-foreground">{profile.gender}</p>
                {profile.city && (
                  <p className="text-muted-foreground flex items-center justify-center gap-1 mt-1">
                    <MapPin className="h-4 w-4" />
                    {profile.city}
                  </p>
                )}
                <p className="text-foreground mt-2">{profile.bio || "Ingen bio endnu"}</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 justify-center">
            {isEditing ? (
              <>
                <Button
                  variant="ghost"
                  onClick={() => setIsEditing(false)}
                  disabled={loading}
                >
                  <X className="h-4 w-4" />
                  Annuller
                </Button>
                <Button
                  variant="gradient"
                  onClick={handleSave}
                  disabled={loading}
                >
                  <Check className="h-4 w-4" />
                  {loading ? "Gemmer..." : "Gem"}
                </Button>
              </>
            ) : (
              <Button variant="secondary" onClick={startEditing}>
                <Edit2 className="h-4 w-4" />
                Rediger profil
              </Button>
            )}
          </div>
        </div>

        {/* Interests */}
        <div className="bg-card rounded-3xl p-6 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg text-foreground">Mine interesser</h3>
            <span className="text-sm text-muted-foreground">
              {isEditing ? selectedInterests.length : userInterests.length} valgt
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {isEditing ? (
              allInterests.map((interest) => (
                <InterestBadge
                  key={interest.id}
                  interest={interest.name}
                  isSelected={selectedInterests.includes(interest.id)}
                  onClick={() => toggleInterest(interest.id)}
                />
              ))
            ) : userInterests.length > 0 ? (
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
              {isEditing ? selectedInterests.length : userInterests.length}
            </p>
            <p className="text-xs text-muted-foreground">Interesser</p>
          </div>
          <div className="bg-card rounded-2xl p-4 shadow-soft text-center">
            <p className="text-2xl font-bold text-primary">{friendCount}</p>
            <p className="text-xs text-muted-foreground">Venner</p>
          </div>
        </div>
      </div>
    </div>
  );
}