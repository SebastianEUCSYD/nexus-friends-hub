import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { InterestBadge } from "@/components/InterestBadge";
import { toast } from "@/hooks/use-toast";
import { ArrowRight, Camera, User } from "lucide-react";

const avatarOptions = [
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
];

interface Interest {
  id: string;
  name: string;
}

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { user, profile, refreshProfile } = useAuth();
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [bio, setBio] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState(avatarOptions[0]);
  const [interests, setInterests] = useState<Interest[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

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

  const toggleInterest = (interestId: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interestId)
        ? prev.filter((id) => id !== interestId)
        : [...prev, interestId]
    );
  };

  const handleNext = () => {
    if (step === 1) {
      if (!name.trim()) {
        toast({ title: "Indtast dit navn", variant: "destructive" });
        return;
      }
      if (!age || parseInt(age) < 13 || parseInt(age) > 120) {
        toast({ title: "Indtast en gyldig alder", variant: "destructive" });
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
      // Create profile
      const { error: profileError } = await supabase.from("profiles").insert({
        user_id: user.id,
        name: name.trim(),
        age: parseInt(age),
        gender,
        bio: bio.trim() || null,
        avatar_url: selectedAvatar,
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
      console.error("Profile creation error:", error);
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

            {/* Avatar Selection */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <img
                  src={selectedAvatar}
                  alt="Selected avatar"
                  className="h-24 w-24 rounded-full object-cover ring-4 ring-primary shadow-glow"
                />
                <div className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full gradient-primary flex items-center justify-center">
                  <Camera className="h-4 w-4 text-primary-foreground" />
                </div>
              </div>
              <div className="flex gap-2 flex-wrap justify-center">
                {avatarOptions.map((avatar) => (
                  <button
                    key={avatar}
                    onClick={() => setSelectedAvatar(avatar)}
                    className={`h-12 w-12 rounded-full overflow-hidden ring-2 transition-all ${
                      selectedAvatar === avatar
                        ? "ring-primary scale-110"
                        : "ring-transparent hover:ring-muted-foreground"
                    }`}
                  >
                    <img
                      src={avatar}
                      alt="Avatar option"
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Dit navn"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-14 px-4 rounded-2xl bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-soft"
              />
              <input
                type="number"
                placeholder="Din alder"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                min={13}
                max={120}
                className="w-full h-14 px-4 rounded-2xl bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-soft"
              />
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
