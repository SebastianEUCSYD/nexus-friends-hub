import { useState, useEffect } from "react";
import { PageHeader } from "@/components/PageHeader";
import { InterestBadge } from "@/components/InterestBadge";
import { useAuth } from "@/contexts/AuthContext";
import { useProfiles } from "@/hooks/useProfiles";
import { Avatar } from "@/components/Avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Sparkles, Users, Check, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Activity {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: string;
  participants: number;
}

const activities: Activity[] = [
  {
    id: "1",
    title: "Gaming aften",
    description: "Saml vennerne til en episk gaming session med snacks og sjov",
    category: "Gaming",
    icon: "🎮",
    participants: 4,
  },
  {
    id: "2",
    title: "Filmmaraton",
    description: "Vælg et tema og se film hele natten lang",
    category: "Film",
    icon: "🎬",
    participants: 5,
  },
  {
    id: "3",
    title: "Outdoor fitness",
    description: "Træn sammen i parken - det er sjovere sammen!",
    category: "Fitness",
    icon: "💪",
    participants: 3,
  },
  {
    id: "4",
    title: "Madlavnings-challenge",
    description: "Lav mad sammen og bedøm hinandens retter",
    category: "Madlavning",
    icon: "👨‍🍳",
    participants: 4,
  },
  {
    id: "5",
    title: "Musik jam session",
    description: "Bring instrumenter og jam sammen",
    category: "Musik",
    icon: "🎵",
    participants: 6,
  },
  {
    id: "6",
    title: "Foto-walk",
    description: "Udforsk byen og tag billeder sammen",
    category: "Fotografering",
    icon: "📸",
    participants: 4,
  },
  {
    id: "7",
    title: "Tech hackathon",
    description: "Byg noget fedt sammen på en weekend",
    category: "Tech",
    icon: "💻",
    participants: 4,
  },
  {
    id: "8",
    title: "Yoga i parken",
    description: "Find indre ro sammen under åben himmel",
    category: "Yoga",
    icon: "🧘",
    participants: 6,
  },
  {
    id: "9",
    title: "Kunstworkshop",
    description: "Mal, tegn eller skab noget kreativt sammen",
    category: "Kunst",
    icon: "🎨",
    participants: 5,
  },
  {
    id: "10",
    title: "Roadtrip",
    description: "Tag på spontan køretur og udforsk nye steder",
    category: "Rejser",
    icon: "🚗",
    participants: 4,
  },
];

export default function IdeasPage() {
  const { userInterests } = useAuth();
  const { profiles } = useProfiles();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);

  const userInterestNames = userInterests.map((i) => i.name);
  const categories = [...new Set(activities.map((a) => a.category))];

  // Get friends only
  const friends = profiles.filter((p) => p.friendshipStatus === "accepted");

  const filteredActivities = selectedCategory
    ? activities.filter((a) => a.category === selectedCategory)
    : activities.filter((a) => userInterestNames.includes(a.category));

  // If no matching interests, show all
  const displayActivities =
    filteredActivities.length > 0 ? filteredActivities : activities;

  const handleActivityClick = (activity: Activity) => {
    setSelectedActivity(activity);
    setSelectedFriends([]);
    setDialogOpen(true);
  };

  const toggleFriend = (friendUserId: string) => {
    setSelectedFriends((prev) =>
      prev.includes(friendUserId)
        ? prev.filter((id) => id !== friendUserId)
        : [...prev, friendUserId]
    );
  };

  const handleConfirmActivity = () => {
    if (!selectedActivity) return;
    
    const friendNames = selectedFriends
      .map((id) => friends.find((f) => f.user_id === id)?.name)
      .filter(Boolean)
      .join(", ");

    toast({
      title: `${selectedActivity.title} planlagt! 🎉`,
      description: selectedFriends.length > 0 
        ? `Du har inviteret: ${friendNames}` 
        : "Du har ikke valgt nogle venner endnu",
    });
    
    setDialogOpen(false);
    setSelectedActivity(null);
    setSelectedFriends([]);
  };

  return (
    <div className="min-h-screen pb-24">
      <PageHeader
        title="Idéer"
        subtitle="Aktiviteter baseret på jeres interesser"
      >
        <div className="h-10 w-10 rounded-2xl gradient-primary flex items-center justify-center shadow-soft">
          <Sparkles className="h-5 w-5 text-primary-foreground" />
        </div>
      </PageHeader>

      <div className="px-4 space-y-6">
        {/* Category Filter */}
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground mb-3">
            Kategorier
          </h2>
          <div className="flex flex-wrap gap-2">
            <InterestBadge
              interest="Alle"
              isSelected={selectedCategory === null}
              onClick={() => setSelectedCategory(null)}
              size="sm"
            />
            {categories.map((category) => (
              <InterestBadge
                key={category}
                interest={category}
                isSelected={selectedCategory === category}
                onClick={() => setSelectedCategory(category)}
                size="sm"
              />
            ))}
          </div>
        </div>

        {/* Activities */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-muted-foreground">
            {displayActivities.length}{" "}
            {displayActivities.length === 1 ? "idé" : "idéer"} til jer
          </h2>

          <div className="grid gap-4">
            {displayActivities.map((activity, index) => (
              <div
                key={activity.id}
                style={{ animationDelay: `${index * 100}ms` }}
                className="bg-card rounded-3xl p-5 shadow-card animate-fade-in hover:shadow-glow transition-all duration-300"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="h-14 w-14 rounded-2xl gradient-primary flex items-center justify-center text-2xl shadow-soft">
                    {activity.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg text-foreground mb-1">
                      {activity.title}
                    </h3>
                    <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                      {activity.category}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-4">
                  {activity.description}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{activity.participants} personer</span>
                  </div>
                  <Button
                    variant="gradient"
                    size="sm"
                    onClick={() => handleActivityClick(activity)}
                  >
                    Prøv det
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Friend Selection Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-2xl">{selectedActivity?.icon}</span>
              {selectedActivity?.title}
            </DialogTitle>
            <DialogDescription>
              Vælg hvilke venner du vil lave denne aktivitet med
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {friends.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                Du har ingen venner endnu. Find venner under "Opdag"!
              </p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {friends.map((friend) => (
                  <button
                    key={friend.user_id}
                    onClick={() => toggleFriend(friend.user_id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all ${
                      selectedFriends.includes(friend.user_id)
                        ? "bg-primary/10 ring-2 ring-primary"
                        : "bg-secondary hover:bg-secondary/80"
                    }`}
                  >
                    <Avatar
                      src={friend.avatar_url || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"}
                      alt={friend.name}
                      size="md"
                      isOnline={friend.is_online}
                    />
                    <div className="flex-1 text-left">
                      <p className="font-medium text-foreground">{friend.name}</p>
                      {friend.city && (
                        <p className="text-sm text-muted-foreground">{friend.city}</p>
                      )}
                    </div>
                    {selectedFriends.includes(friend.user_id) && (
                      <div className="h-6 w-6 rounded-full gradient-primary flex items-center justify-center">
                        <Check className="h-4 w-4 text-primary-foreground" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setDialogOpen(false)}
              >
                <X className="h-4 w-4" />
                Annuller
              </Button>
              <Button
                variant="gradient"
                className="flex-1"
                onClick={handleConfirmActivity}
              >
                <Check className="h-4 w-4" />
                {selectedFriends.length > 0
                  ? `Inviter ${selectedFriends.length} ${selectedFriends.length === 1 ? "ven" : "venner"}`
                  : "Gør det selv"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}