import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Avatar } from "@/components/Avatar";
import { InterestBadge } from "@/components/InterestBadge";
import { Button } from "@/components/ui/button";
import { currentUser, allInterests } from "@/data/mockData";
import { Settings, Edit2, Camera } from "lucide-react";

export default function ProfilePage() {
  const [user, setUser] = useState(currentUser);
  const [isEditing, setIsEditing] = useState(false);

  const toggleInterest = (interest: string) => {
    setUser(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  return (
    <div className="min-h-screen pb-24">
      <PageHeader title="Profil">
        <Button variant="ghost" size="icon">
          <Settings className="h-5 w-5" />
        </Button>
      </PageHeader>
      
      <div className="px-4 space-y-6">
        {/* Profile Header */}
        <div className="bg-card rounded-3xl p-6 shadow-card text-center">
          <div className="relative inline-block mb-4">
            <Avatar src={user.avatar} alt={user.name} size="xl" isOnline />
            <button className="absolute bottom-0 right-0 h-10 w-10 rounded-full gradient-primary flex items-center justify-center shadow-soft">
              <Camera className="h-5 w-5 text-primary-foreground" />
            </button>
          </div>
          
          <h2 className="text-2xl font-bold text-foreground mb-1">
            {user.name}, {user.age}
          </h2>
          <p className="text-muted-foreground mb-4">{user.gender}</p>
          <p className="text-foreground">{user.bio}</p>
          
          <Button
            variant={isEditing ? "gradient" : "secondary"}
            className="mt-4"
            onClick={() => setIsEditing(!isEditing)}
          >
            <Edit2 className="h-4 w-4" />
            {isEditing ? "Gem ændringer" : "Rediger profil"}
          </Button>
        </div>

        {/* Interests */}
        <div className="bg-card rounded-3xl p-6 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg text-foreground">Mine interesser</h3>
            <span className="text-sm text-muted-foreground">
              {user.interests.length} valgt
            </span>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {isEditing ? (
              allInterests.map(interest => (
                <InterestBadge
                  key={interest}
                  interest={interest}
                  isSelected={user.interests.includes(interest)}
                  onClick={() => toggleInterest(interest)}
                />
              ))
            ) : (
              user.interests.map(interest => (
                <InterestBadge key={interest} interest={interest} isSelected />
              ))
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-card rounded-2xl p-4 shadow-soft text-center">
            <p className="text-2xl font-bold text-primary">12</p>
            <p className="text-xs text-muted-foreground">Venner</p>
          </div>
          <div className="bg-card rounded-2xl p-4 shadow-soft text-center">
            <p className="text-2xl font-bold text-primary">5</p>
            <p className="text-xs text-muted-foreground">Interesser</p>
          </div>
          <div className="bg-card rounded-2xl p-4 shadow-soft text-center">
            <p className="text-2xl font-bold text-primary">28</p>
            <p className="text-xs text-muted-foreground">Aktiviteter</p>
          </div>
        </div>
      </div>
    </div>
  );
}
