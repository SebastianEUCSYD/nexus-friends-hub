import { useState, useEffect } from "react";
import { PageHeader } from "@/components/PageHeader";
import { InterestBadge } from "@/components/InterestBadge";
import { useAuth } from "@/contexts/AuthContext";
import { useProfiles } from "@/hooks/useProfiles";
import { useActivityInvitations } from "@/hooks/useActivityInvitations";
import { Avatar } from "@/components/Avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Sparkles, Users, Check, X, Bell, RefreshCw } from "lucide-react";
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
  // Gaming
  { id: "1", title: "Gaming aften", description: "Saml vennerne til en episk gaming session med snacks og sjov", category: "Gaming", icon: "🎮", participants: 4 },
  { id: "2", title: "Retro gaming turnering", description: "Konkurrér i klassiske spil fra 90'erne og 00'erne", category: "Gaming", icon: "👾", participants: 4 },
  { id: "3", title: "LAN party", description: "Bring computerne og spil sammen hele natten", category: "Gaming", icon: "🖥️", participants: 6 },
  
  // Film
  { id: "4", title: "Filmmaraton", description: "Vælg et tema og se film hele natten lang", category: "Film", icon: "🎬", participants: 5 },
  { id: "5", title: "Oscar-aften", description: "Se de nominerede film og stem på jeres favoritter", category: "Film", icon: "🏆", participants: 4 },
  { id: "6", title: "Hjemmebiograf", description: "Popcorn, tæpper og storskærm derhjemme", category: "Film", icon: "🍿", participants: 6 },
  
  // Fitness
  { id: "7", title: "Outdoor fitness", description: "Træn sammen i parken - det er sjovere sammen!", category: "Fitness", icon: "💪", participants: 3 },
  { id: "8", title: "Morgenløb", description: "Start dagen med en løbetur sammen", category: "Fitness", icon: "🏃", participants: 4 },
  { id: "9", title: "Svømmetur", description: "Tag i svømmehallen eller find en sø", category: "Fitness", icon: "🏊", participants: 4 },
  { id: "10", title: "Cykeltour", description: "Udforsk nye ruter på to hjul", category: "Fitness", icon: "🚴", participants: 5 },
  
  // Madlavning
  { id: "11", title: "Madlavnings-challenge", description: "Lav mad sammen og bedøm hinandens retter", category: "Madlavning", icon: "👨‍🍳", participants: 4 },
  { id: "12", title: "Sushi-aften", description: "Rul jeres egne sushi sammen", category: "Madlavning", icon: "🍣", participants: 4 },
  { id: "13", title: "Bageworkshop", description: "Bag kager, brød eller cookies sammen", category: "Madlavning", icon: "🥐", participants: 3 },
  { id: "14", title: "Grill i haven", description: "Tænd grillen og nyd sommervejret", category: "Madlavning", icon: "🍖", participants: 6 },
  { id: "15", title: "Tema-middag", description: "Vælg et land og lav autentisk mad derfra", category: "Madlavning", icon: "🌮", participants: 5 },
  
  // Musik
  { id: "16", title: "Musik jam session", description: "Bring instrumenter og jam sammen", category: "Musik", icon: "🎵", participants: 6 },
  { id: "17", title: "Karaoke-aften", description: "Syng jeres yndlingssange højt og skævt", category: "Musik", icon: "🎤", participants: 8 },
  { id: "18", title: "Koncert sammen", description: "Find en koncert og oplev live musik", category: "Musik", icon: "🎸", participants: 4 },
  { id: "19", title: "Vinyl-aften", description: "Del og lyt til hinandens pladesamlinger", category: "Musik", icon: "📀", participants: 4 },
  
  // Fotografering
  { id: "20", title: "Foto-walk", description: "Udforsk byen og tag billeder sammen", category: "Fotografering", icon: "📸", participants: 4 },
  { id: "21", title: "Golden hour shoot", description: "Tag billeder i det perfekte lys ved solnedgang", category: "Fotografering", icon: "🌅", participants: 3 },
  { id: "22", title: "Street photography", description: "Fang byens puls med jeres kameraer", category: "Fotografering", icon: "🏙️", participants: 3 },
  
  // Tech
  { id: "23", title: "Tech hackathon", description: "Byg noget fedt sammen på en weekend", category: "Tech", icon: "💻", participants: 4 },
  { id: "24", title: "Coding session", description: "Par-programmér og lær af hinanden", category: "Tech", icon: "⌨️", participants: 2 },
  { id: "25", title: "Tech talk aften", description: "Del viden om nye teknologier", category: "Tech", icon: "🤖", participants: 5 },
  
  // Yoga
  { id: "26", title: "Yoga i parken", description: "Find indre ro sammen under åben himmel", category: "Yoga", icon: "🧘", participants: 6 },
  { id: "27", title: "Morgenyoga", description: "Start dagen med stretching og meditation", category: "Yoga", icon: "☀️", participants: 4 },
  { id: "28", title: "Yoga & brunch", description: "Kombiner yoga med en lækker fælles brunch", category: "Yoga", icon: "🥗", participants: 5 },
  
  // Kunst
  { id: "29", title: "Kunstworkshop", description: "Mal, tegn eller skab noget kreativt sammen", category: "Kunst", icon: "🎨", participants: 5 },
  { id: "30", title: "Museumsbesøg", description: "Udforsk kunst og kultur sammen", category: "Kunst", icon: "🖼️", participants: 4 },
  { id: "31", title: "Keramik-aften", description: "Form ler og skab unikke kunstværker", category: "Kunst", icon: "🏺", participants: 4 },
  
  // Rejser
  { id: "32", title: "Roadtrip", description: "Tag på spontan køretur og udforsk nye steder", category: "Rejser", icon: "🚗", participants: 4 },
  { id: "33", title: "Camping weekend", description: "Pak telt og sovepose og tag ud i naturen", category: "Rejser", icon: "⛺", participants: 4 },
  { id: "34", title: "Dagstur til ny by", description: "Udforsk en by I ikke har været i før", category: "Rejser", icon: "🚂", participants: 5 },
  { id: "35", title: "Vandretur", description: "Find en smuk rute og gå sammen i naturen", category: "Rejser", icon: "🥾", participants: 4 },
  
  // Nye kategorier
  { id: "36", title: "Brætspilsaften", description: "Klassiske og nye brætspil med snacks", category: "Spil", icon: "🎲", participants: 5 },
  { id: "37", title: "Escape room", description: "Løs gåder og flygt sammen", category: "Spil", icon: "🔐", participants: 5 },
  { id: "38", title: "Quiz-aften", description: "Test jeres viden mod hinanden", category: "Spil", icon: "🧠", participants: 6 },
  { id: "39", title: "Poker night", description: "Chips, kort og bluff - hvem vinder?", category: "Spil", icon: "🃏", participants: 6 },
  
  { id: "40", title: "Bogklub møde", description: "Læs den samme bog og diskutér den sammen", category: "Bøger", icon: "📚", participants: 5 },
  { id: "41", title: "Skriveworkshop", description: "Skriv noveller eller digte sammen", category: "Bøger", icon: "✍️", participants: 4 },
  
  { id: "42", title: "Picnic i parken", description: "Pak madkurven og nyd solen sammen", category: "Social", icon: "🧺", participants: 6 },
  { id: "43", title: "Brunch date", description: "Find den bedste brunch i byen", category: "Social", icon: "🥞", participants: 4 },
  { id: "44", title: "Café-hopping", description: "Prøv flere caféer på én dag", category: "Social", icon: "☕", participants: 3 },
  { id: "45", title: "Vinsmagning", description: "Udforsk forskellige vine sammen", category: "Social", icon: "🍷", participants: 5 },
  
  { id: "46", title: "Strandddag", description: "Sol, sand og badning med vennerne", category: "Udendørs", icon: "🏖️", participants: 6 },
  { id: "47", title: "Stjernekigning", description: "Find et mørkt sted og se på stjernerne", category: "Udendørs", icon: "⭐", participants: 4 },
  { id: "48", title: "Fisketur", description: "Tag stængerne med og nyd freden ved vandet", category: "Udendørs", icon: "🎣", participants: 3 },
  { id: "49", title: "Klatring", description: "Udfordr jer selv i en klatrehal", category: "Udendørs", icon: "🧗", participants: 4 },
  { id: "50", title: "Paddleboarding", description: "Prøv kræfter med SUP på vandet", category: "Udendørs", icon: "🏄", participants: 4 },
];

export default function IdeasPage() {
  const { userInterests } = useAuth();
  const { profiles } = useProfiles();
  const { sendInvitations, unreadCount, invitations, markAllAsRead } = useActivityInvitations();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [invitationsDialogOpen, setInvitationsDialogOpen] = useState(false);
  const [sending, setSending] = useState(false);
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

  const handleRefreshIdeas = () => {
    setShuffleSeed(prev => prev + 1);
  };

  const userInterestNames = userInterests.map((i) => i.name);
  const categories = [...new Set(activities.map((a) => a.category))];

  // Get friends only
  const friends = profiles.filter((p) => p.friendshipStatus === "accepted");

  const filteredActivities = selectedCategory
    ? activities.filter((a) => a.category === selectedCategory)
    : activities.filter((a) => userInterestNames.includes(a.category));

  // If no matching interests, show all
  const baseActivities =
    filteredActivities.length > 0 ? filteredActivities : activities;
  
  // Shuffle and limit to show variety
  const displayActivities = shuffleArray(baseActivities, shuffleSeed).slice(0, 6);

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

  const handleConfirmActivity = async () => {
    if (!selectedActivity) return;
    
    setSending(true);
    
    if (selectedFriends.length > 0) {
      const { error } = await sendInvitations(
        selectedFriends,
        selectedActivity.title,
        selectedActivity.icon
      );
      
      if (error) {
        toast({
          title: "Noget gik galt",
          description: error.message,
          variant: "destructive",
        });
        setSending(false);
        return;
      }
    }
    
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
    setSending(false);
  };

  return (
    <div className="min-h-screen pb-24">
      <PageHeader
        title="Idéer"
        subtitle="Aktiviteter baseret på jeres interesser"
      >
        <div className="flex items-center gap-2">
          {/* Invitations button */}
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={() => {
              setInvitationsDialogOpen(true);
              markAllAsRead();
            }}
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </Button>
          <div className="h-10 w-10 rounded-2xl gradient-primary flex items-center justify-center shadow-soft">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
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
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-muted-foreground">
              {displayActivities.length}{" "}
              {displayActivities.length === 1 ? "idé" : "idéer"} til jer
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefreshIdeas}
              className="text-muted-foreground hover:text-foreground"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Nye idéer
            </Button>
          </div>

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
                disabled={sending}
              >
                <X className="h-4 w-4" />
                Annuller
              </Button>
              <Button
                variant="gradient"
                className="flex-1"
                onClick={handleConfirmActivity}
                disabled={sending}
              >
                <Check className="h-4 w-4" />
                {sending
                  ? "Sender..."
                  : selectedFriends.length > 0
                  ? `Inviter ${selectedFriends.length} ${selectedFriends.length === 1 ? "ven" : "venner"}`
                  : "Gør det selv"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Invitations Dialog */}
      <Dialog open={invitationsDialogOpen} onOpenChange={setInvitationsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Aktivitetsinvitationer
            </DialogTitle>
            <DialogDescription>
              Her kan du se hvem der har inviteret dig til aktiviteter
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 mt-4 max-h-80 overflow-y-auto">
            {invitations.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                Du har ingen invitationer endnu
              </p>
            ) : (
              invitations.map((inv) => (
                <div
                  key={inv.id}
                  className={`flex items-center gap-3 p-3 rounded-2xl ${
                    inv.is_read ? "bg-secondary" : "bg-primary/10"
                  }`}
                >
                  <div className="h-12 w-12 rounded-xl bg-secondary flex items-center justify-center text-xl">
                    {inv.activity_icon}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">
                      {inv.sender_name} har inviteret dig
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {inv.activity_title}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}