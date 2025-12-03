import { Activity } from "@/types";
import { Button } from "./ui/button";
import { Users } from "lucide-react";

interface ActivityCardProps {
  activity: Activity;
}

export function ActivityCard({ activity }: ActivityCardProps) {
  return (
    <div className="bg-card rounded-3xl p-5 shadow-card animate-fade-in hover:shadow-glow transition-all duration-300">
      <div className="flex items-start gap-4 mb-4">
        <div className="h-14 w-14 rounded-2xl gradient-primary flex items-center justify-center text-2xl shadow-soft">
          {activity.icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-lg text-foreground mb-1">{activity.title}</h3>
          <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
            {activity.category}
          </span>
        </div>
      </div>
      
      <p className="text-sm text-muted-foreground mb-4">{activity.description}</p>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>{activity.participants} personer</span>
        </div>
        <Button variant="gradient" size="sm">
          Prøv det
        </Button>
      </div>
    </div>
  );
}
