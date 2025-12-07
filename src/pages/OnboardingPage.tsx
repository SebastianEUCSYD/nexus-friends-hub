import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { InterestBadge } from "@/components/InterestBadge";
import { toast } from "@/hooks/use-toast";
import { ArrowRight, Camera, User, MapPin, AtSign, Calendar } from "lucide-react";
import { validateImageFile } from "@/lib/validation";

interface Interest {
  id: string;
  name: string;
}

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { user, profile, refreshProfile } = useAuth();
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [birthday, setBirthday] = useState("");
  const [city, setCity] = useState("");
  const [gender, setGender] = useState("");
  const [bio, setBio] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [interests, setInterests] = useState<Interest[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (profile) {
      navigate("/chat");
    }
  }, [profile, navigate]);

  useEffect(() => {
    const fetchInterests = async () => {
      const { data } = await supabase.from("interests").select("*");
      if (data) setInterests(data);
    };
    fetchInterests();
  }, []);

  // Check username availability
  useEffect(() => {
    const checkUsername = async () => {
      if (!username || username.length < 3) {
        setUsernameAvailable(null);
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
  }, [username]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file
      const validation = validateImageFile(file);
      if (!validation.valid) {
        toast({ title: validation.error, variant: "destructive" });
        return;
      }

      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleInterest = (interestId: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interestId)
        ? prev.filter((id) => id !== interestId)
        : [...prev, interestId]
    );
  };

  const calculateAge = (birthdayStr: string): number => {
    const today = new Date();
    const birthDate = new Date(birthdayStr);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleNext = () => {
    if (step === 1) {
      if (!name.trim()) {
        toast({ title: "Indtast dit navn", variant: "destructive" });
        return;
      }
      if (!username.trim() || username.length < 3) {
        toast({ title: "Brugernavn skal være mindst 3 tegn", variant: "destructive" });
        return;
      }
      if (usernameAvailable === false) {
        toast({ title: "Brugernavnet er allerede taget", variant: "destructive" });
        return;
      }
      if (!birthday) {
        toast({ title: "Indtast din fødselsdag", variant: "destructive" });
        return;
      }
      const age = calculateAge(birthday);
      if (age < 13 || age > 120) {
        toast({ title: "Du skal være mindst 13 år", variant: "destructive" });
        return;
      }
      if (!city.trim()) {
        toast({ title: "Indtast din by", variant: "destructive" });
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!gender) {
        toast({ title: "Vælg dit køn", variant: "destructive" });
        return;
      }
      setStep(3);
    } else if (step === 3) {
      if (selectedInterests.length < 3) {
        toast({ title: "Vælg mindst 3 interesser", variant: "destructive" });
        return;
      }
      handleCreateProfile();
    }
  };

  const handleCreateProfile = async () => {
    if (!user) return;
    setLoading(true);

    try {
      let avatarUrl: string | null = null;

      // Upload avatar if selected
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

      // Create profile
      const { error: profileError } = await supabase.from("profiles").insert({
        user_id: user.id,
        name: name.trim(),
        username: username.toLowerCase().trim(),
        birthday,
        city: city.trim(),
        gender,
        bio: bio.trim() || null,
        avatar_url: avatarUrl,
        is_online: true,
      });

      if (profileError) throw profileError;

      // Create user interests
      const interestInserts = selectedInterests.map((interestId) => ({
        user_id: user.id,
        interest_id: interestId,
      }));

      const { error: interestsError } = await supabase
        .from("user_interests")
        .insert(interestInserts);

      if (interestsError) throw interestsError;

      await refreshProfile();
      toast({ title: "Profil oprettet! 🎉" });
      navigate("/chat");
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

  if (!user) {
    navigate("/auth");
    return null;
  }

  return (
    <div className="min-h-screen px-4 py-8 gradient-soft">
      <div className="max-w-md mx-auto space-y-6 animate-fade-in">
        {/* Progress */}
        <div className="flex gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`flex-1 h-2 rounded-full transition-all ${
                s <= step ? "gradient-primary" : "bg-secondary"
              }`}
            />
          ))}
        </div>

        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-foreground">
                Fortæl os om dig selv
              </h1>
              <p className="text-muted-foreground mt-2">
                Start med det basale
              </p>
            </div>

            {/* Avatar Upload */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Avatar preview"
                    className="h-24 w-24 rounded-full object-cover ring-4 ring-primary shadow-glow"
                  />
                ) : (
                  <div className="h-24 w-24 rounded-full bg-secondary flex items-center justify-center ring-4 ring-primary/50">
                    <User className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full gradient-primary flex items-center justify-center"
                >
                  <Camera className="h-4 w-4 text-primary-foreground" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>
              <p className="text-sm text-muted-foreground">Tryk for at uploade et billede</p>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Dit navn"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-14 px-4 rounded-2xl bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-soft"
              />
              
              <div className="relative">
                <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Brugernavn"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ""))}
                  className={`w-full h-14 pl-12 pr-4 rounded-2xl bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 shadow-soft ${
                    usernameAvailable === true ? "focus:ring-green-500/50 ring-2 ring-green-500/50" : 
                    usernameAvailable === false ? "focus:ring-red-500/50 ring-2 ring-red-500/50" : 
                    "focus:ring-primary/50"
                  }`}
                />
                {username.length >= 3 && (
                  <span className={`absolute right-4 top-1/2 -translate-y-1/2 text-xs ${
                    usernameAvailable ? "text-green-500" : "text-red-500"
                  }`}>
                    {usernameAvailable ? "Tilgængelig" : "Optaget"}
                  </span>
                )}
              </div>

              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="date"
                  placeholder="Fødselsdag"
                  value={birthday}
                  onChange={(e) => setBirthday(e.target.value)}
                  max={new Date().toISOString().split("T")[0]}
                  className="w-full h-14 pl-12 pr-4 rounded-2xl bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-soft"
                />
              </div>

              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Din by"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full h-14 pl-12 pr-4 rounded-2xl bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-soft"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Gender & Bio */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-foreground">
                Lidt mere om dig
              </h1>
              <p className="text-muted-foreground mt-2">
                Hjælp andre med at lære dig at kende
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  Køn
                </label>
                <div className="flex gap-3">
                  {["Mand", "Kvinde", "Andet"].map((g) => (
                    <button
                      key={g}
                      onClick={() => setGender(g)}
                      className={`flex-1 h-12 rounded-2xl font-medium transition-all ${
                        gender === g
                          ? "gradient-primary text-primary-foreground shadow-soft"
                          : "bg-card text-foreground hover:bg-secondary"
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  Bio (valgfrit)
                </label>
                <textarea
                  placeholder="Fortæl lidt om dig selv..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  maxLength={200}
                  rows={3}
                  className="w-full px-4 py-3 rounded-2xl bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-soft resize-none"
                />
                <p className="text-xs text-muted-foreground text-right mt-1">
                  {bio.length}/200
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Interests */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-foreground">
                Hvad interesserer dig?
              </h1>
              <p className="text-muted-foreground mt-2">
                Vælg mindst 3 interesser
              </p>
            </div>

            <div className="flex flex-wrap gap-3 justify-center">
              {interests.map((interest) => (
                <InterestBadge
                  key={interest.id}
                  interest={interest.name}
                  isSelected={selectedInterests.includes(interest.id)}
                  onClick={() => toggleInterest(interest.id)}
                />
              ))}
            </div>

            <p className="text-center text-sm text-muted-foreground">
              {selectedInterests.length} af mindst 3 valgt
            </p>
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-3 pt-4">
          {step > 1 && (
            <Button
              variant="secondary"
              size="lg"
              onClick={() => setStep(step - 1)}
              className="flex-1"
            >
              Tilbage
            </Button>
          )}
          <Button
            variant="gradient"
            size="lg"
            onClick={handleNext}
            disabled={loading}
            className="flex-1"
          >
            {loading ? "Opretter..." : step === 3 ? "Færdig" : "Næste"}
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}