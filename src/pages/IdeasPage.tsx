import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { ActivityCard } from "@/components/ActivityCard";
import { InterestBadge } from "@/components/InterestBadge";
import { useAuth } from "@/contexts/AuthContext";
import { Sparkles } from "lucide-react";

const activities = [
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
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const userInterestNames = userInterests.map(i => i.name);
  const categories = [...new Set(activities.map((a) => a.category))];

  const filteredActivities = selectedCategory
    ? activities.filter((a) => a.category === selectedCategory)
    : activities.filter((a) => userInterestNames.includes(a.category));

  // If no matching interests, show all
  const displayActivities = filteredActivities.length > 0 ? filteredActivities : activities;

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
              <div key={activity.id} style={{ animationDelay: `${index * 100}ms` }}>
                <ActivityCard activity={activity} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
