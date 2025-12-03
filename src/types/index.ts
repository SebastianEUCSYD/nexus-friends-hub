export interface User {
  id: string;
  name: string;
  age: number;
  gender: string;
  avatar: string;
  interests: string[];
  bio: string;
  isOnline: boolean;
  isFriend: boolean;
}

export interface Chat {
  id: string;
  user: User;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
}

export interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
}

export interface Activity {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: string;
  participants: number;
}
