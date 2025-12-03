import { User } from "@/types";
import { Avatar } from "./Avatar";
import { InterestBadge } from "./InterestBadge";
import { Button } from "./ui/button";
import { UserPlus, Check } from "lucide-react";
import { currentUser } from "@/data/mockData";

interface UserCardProps {
  user: User;
  onClick: () => void;
  onAddFriend?: () => void;
}

export function UserCard({ user, onClick, onAddFriend }: UserCardProps) {
  const sharedInterests = user.interests.filter(i => 
    currentUser.interests.includes(i)
  );

  return (
    <div className="bg-card rounded-3xl p-5 shadow-card animate-fade-in">
      <button onClick={onClick} className="w-full text-left">
        <div className="flex items-start gap-4 mb-4">
          <Avatar 
            src={user.avatar} 
            alt={user.name} 
            size="lg" 
            isOnline={user.isOnline} 
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg text-foreground">{user.name}, {user.age}</h3>
            <p className="text-sm text-muted-foreground">{user.bio}</p>
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
      
      {onAddFriend && (
        <Button
          onClick={(e) => {
            e.stopPropagation();
            onAddFriend();
          }}
          variant={user.isFriend ? "secondary" : "gradient"}
          className="w-full"
          disabled={user.isFriend}
        >
          {user.isFriend ? (
            <>
              <Check className="h-4 w-4" />
              Venner
            </>
          ) : (
            <>
              <UserPlus className="h-4 w-4" />
              Tilføj ven
            </>
          )}
        </Button>
      )}
    </div>
  );
}
