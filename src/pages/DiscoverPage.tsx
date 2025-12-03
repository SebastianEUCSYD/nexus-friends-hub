import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { UserCard } from "@/components/UserCard";
import { InterestBadge } from "@/components/InterestBadge";
import { users, allInterests, currentUser } from "@/data/mockData";
import { User } from "@/types";
import { toast } from "@/hooks/use-toast";

export default function DiscoverPage() {
  const navigate = useNavigate();
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [userList, setUserList] = useState<User[]>(users);

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev =>
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const filteredUsers = userList.filter(user => {
    if (!user.isFriend && selectedInterests.length === 0) return true;
    if (user.isFriend) return false;
    return selectedInterests.some(interest => user.interests.includes(interest));
  });

  const handleAddFriend = (userId: string) => {
    setUserList(prev =>
      prev.map(user =>
        user.id === userId ? { ...user, isFriend: true } : user
      )
    );
    const user = userList.find(u => u.id === userId);
    toast({
      title: "Venneanmodning sendt! 🎉",
      description: `Du har sendt en anmodning til ${user?.name}`,
    });
  };

  return (
    <div className="min-h-screen pb-24">
      <PageHeader 
        title="Opdag" 
        subtitle="Find nye venner med fælles interesser" 
      />
      
      <div className="px-4 space-y-6">
        {/* Interest Filter */}
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground mb-3">
            Filtrer efter interesser
          </h2>
          <div className="flex flex-wrap gap-2">
            {allInterests.map(interest => (
              <InterestBadge
                key={interest}
                interest={interest}
                isSelected={selectedInterests.includes(interest)}
                onClick={() => toggleInterest(interest)}
                size="sm"
              />
            ))}
          </div>
        </div>

        {/* Users Grid */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-muted-foreground">
            {filteredUsers.length} {filteredUsers.length === 1 ? "person" : "personer"} fundet
          </h2>
          
          {filteredUsers.length > 0 ? (
            <div className="grid gap-4">
              {filteredUsers.map((user, index) => (
                <div
                  key={user.id}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <UserCard
                    user={user}
                    onClick={() => navigate(`/user/${user.id}`)}
                    onAddFriend={() => handleAddFriend(user.id)}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                Ingen nye venner fundet med disse interesser
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
