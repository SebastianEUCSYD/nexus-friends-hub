import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { ActivityCard } from "@/components/ActivityCard";
import { InterestBadge } from "@/components/InterestBadge";
import { activities, currentUser } from "@/data/mockData";
import { Sparkles } from "lucide-react";

export default function IdeasPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = [...new Set(activities.map(a => a.category))];
  
  const filteredActivities = selectedCategory
    ? activities.filter(a => a.category === selectedCategory)
    : activities.filter(a => currentUser.interests.includes(a.category));

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
            {categories.map(category => (
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
            {filteredActivities.length} {filteredActivities.length === 1 ? "idé" : "idéer"} til jer
          </h2>
          
          <div className="grid gap-4">
            {filteredActivities.map((activity, index) => (
              <div
                key={activity.id}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <ActivityCard activity={activity} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
