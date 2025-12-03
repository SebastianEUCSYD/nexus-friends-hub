import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Avatar } from "@/components/Avatar";
import { InterestBadge } from "@/components/InterestBadge";
import { Button } from "@/components/ui/button";
import { users, currentUser } from "@/data/mockData";
import { ArrowLeft, UserPlus, Check, MessageCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function UserProfilePage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(() => users.find(u => u.id === userId));

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Bruger ikke fundet</p>
      </div>
    );
  }

  const sharedInterests = user.interests.filter(i => 
    currentUser.interests.includes(i)
  );

  const handleAddFriend = () => {
    setUser(prev => prev ? { ...prev, isFriend: true } : prev);
    toast({
      title: "Venneanmodning sendt! 🎉",
      description: `Du har sendt en anmodning til ${user.name}`,
    });
  };

  return (
    <div className="min-h-screen pb-24">
      <PageHeader title="">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
      </PageHeader>
      
      <div className="px-4 space-y-6">
        {/* Profile Header */}
        <div className="bg-card rounded-3xl p-6 shadow-card text-center animate-fade-in">
          <Avatar 
            src={user.avatar} 
            alt={user.name} 
            size="xl" 
            isOnline={user.isOnline}
            className="mx-auto mb-4"
          />
          
          <h2 className="text-2xl font-bold text-foreground mb-1">
            {user.name}, {user.age}
          </h2>
          <p className="text-muted-foreground mb-2">{user.gender}</p>
          <span className={`inline-flex items-center gap-1.5 text-sm ${user.isOnline ? "text-online" : "text-muted-foreground"}`}>
            <span className={`h-2 w-2 rounded-full ${user.isOnline ? "bg-online" : "bg-offline"}`} />
            {user.isOnline ? "Online" : "Offline"}
          </span>
          <p className="text-foreground mt-4">{user.bio}</p>
          
          <div className="flex gap-3 mt-6">
            {user.isFriend ? (
              <Button variant="secondary" className="flex-1">
                <MessageCircle className="h-4 w-4" />
                Send besked
              </Button>
            ) : (
              <Button variant="gradient" className="flex-1" onClick={handleAddFriend}>
                <UserPlus className="h-4 w-4" />
                Tilføj ven
              </Button>
            )}
          </div>
        </div>

        {/* Shared Interests */}
        {sharedInterests.length > 0 && (
          <div className="bg-card rounded-3xl p-6 shadow-card animate-slide-up">
            <h3 className="font-bold text-lg text-foreground mb-4">
              🎯 {sharedInterests.length} fælles interesser
            </h3>
            <div className="flex flex-wrap gap-2">
              {sharedInterests.map(interest => (
                <InterestBadge key={interest} interest={interest} isShared />
              ))}
            </div>
          </div>
        )}

        {/* All Interests */}
        <div className="bg-card rounded-3xl p-6 shadow-card animate-slide-up" style={{ animationDelay: "100ms" }}>
          <h3 className="font-bold text-lg text-foreground mb-4">
            Alle interesser
          </h3>
          <div className="flex flex-wrap gap-2">
            {user.interests.map(interest => (
              <InterestBadge 
                key={interest} 
                interest={interest} 
                isShared={currentUser.interests.includes(interest)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
