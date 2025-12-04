import { Avatar } from "./Avatar";
import { InterestBadge } from "./InterestBadge";
import { Button } from "./ui/button";
import { UserPlus, Check, Clock, MapPin } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface User {
  id: string;
  name: string;
  age: number | null;
  city?: string | null;
  bio?: string | null;
  avatar?: string | null;
  isOnline?: boolean;
  interests: string[];
}

interface UserCardProps {
  user: User;
  onClick: () => void;
  onAddFriend?: () => void;
  friendshipStatus?: "none" | "pending" | "accepted" | "requested";
}

export function UserCard({ user, onClick, onAddFriend, friendshipStatus = "none" }: UserCardProps) {
  const { userInterests } = useAuth();
  const myInterestNames = userInterests.map(i => i.name);
  
  const sharedInterests = user.interests.filter(i => 
    myInterestNames.includes(i)
  );

  return (
    <div className="bg-card rounded-3xl p-5 shadow-card animate-fade-in">
      <button onClick={onClick} className="w-full text-left">
        <div className="flex items-start gap-4 mb-4">
          <Avatar 
            src={user.avatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"} 
            alt={user.name} 
            size="lg" 
            isOnline={user.isOnline} 
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg text-foreground">{user.name}, {user.age}</h3>
            {user.city && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
                <MapPin className="h-3 w-3" />
                {user.city}
              </div>
            )}
            <p className="text-sm text-muted-foreground line-clamp-2">{user.bio || "Ingen bio endnu"}</p>
          </div>
        </div>
        
        {sharedInterests.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-muted-foreground mb-2 font-medium">
              {sharedInterests.length} fælles interesser
            </p>
            <div className="flex flex-wrap gap-2">
              {sharedInterests.slice(0, 3).map(interest => (
                <InterestBadge key={interest} interest={interest} isShared size="sm" />
              ))}
              {sharedInterests.length > 3 && (
                <span className="text-xs text-muted-foreground self-center">
                  +{sharedInterests.length - 3} mere
                </span>
              )}
            </div>
          </div>
        )}
      </button>
      
      {friendshipStatus === "none" && onAddFriend && (
        <Button
          onClick={(e) => {
            e.stopPropagation();
            onAddFriend();
          }}
          variant="gradient"
          className="w-full"
        >
          <UserPlus className="h-4 w-4" />
          Tilføj ven
        </Button>
      )}
      
      {friendshipStatus === "pending" && (
        <Button variant="secondary" className="w-full" disabled>
          <Clock className="h-4 w-4" />
          Anmodning sendt
        </Button>
      )}
      
      {friendshipStatus === "accepted" && (
        <Button variant="secondary" className="w-full" disabled>
          <Check className="h-4 w-4" />
          Venner
        </Button>
      )}

      {friendshipStatus === "requested" && (
        <Button variant="gradient" className="w-full" onClick={onClick}>
          <Clock className="h-4 w-4" />
          Vil være din ven
        </Button>
      )}
    </div>
  );
}
