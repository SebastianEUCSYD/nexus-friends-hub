import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar } from "@/components/Avatar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Send, Paperclip, X, Image, Film, File } from "lucide-react";
import { cn } from "@/lib/utils";
import { messageSchema } from "@/lib/validation";
import { toast } from "@/hooks/use-toast";
import { EmojiPicker } from "@/components/EmojiPicker";
import { MessageBubble } from "@/components/MessageBubble";
import { validateImageFile, MAX_FILE_SIZE } from "@/lib/validation";

interface Message {
  id: string;
  content: string;
  sender_id: string;
  receiver_id: string;
  created_at: string;
  is_read: boolean;
  attachment_url?: string | null;
  attachment_type?: string | null;
}

interface FriendProfile {
  user_id: string;
  name: string;
  avatar_url: string | null;
  is_online: boolean;
}

const ALLOWED_FILE_TYPES = [
  "image/jpeg", "image/png", "image/webp", "image/gif",
  "video/mp4", "video/webm", "video/quicktime",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const MAX_VIDEO_SIZE = 25 * 1024 * 1024; // 25MB for videos
const MAX_ATTACHMENT_SIZE = 10 * 1024 * 1024; // 10MB for other files

export default function ConversationPage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [friend, setFriend] = useState<FriendProfile | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [attachment, setAttachment] = useState<File | null>(null);
  const [attachmentPreview, setAttachmentPreview] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback((instant = false) => {
    messagesEndRef.current?.scrollIntoView({ behavior: instant ? "instant" : "smooth" });
  }, []);

  useEffect(() => {
    if (!user || !userId) return;

    const fetchData = async () => {
      setLoading(true);

      const { data: profileData } = await supabase
        .from("profiles")
        .select("user_id, name, avatar_url, is_online")
        .eq("user_id", userId)
        .single();

      if (profileData) setFriend(profileData);

      const { data: messagesData } = await supabase
        .from("messages")
        .select("*")
        .or(
          `and(sender_id.eq.${user.id},receiver_id.eq.${userId}),and(sender_id.eq.${userId},receiver_id.eq.${user.id})`
        )
        .order("created_at", { ascending: true });

      if (messagesData) setMessages(messagesData as Message[]);

      await supabase
        .from("messages")
        .update({ is_read: true })
        .eq("sender_id", userId)
        .eq("receiver_id", user.id)
        .eq("is_read", false);

      setLoading(false);
    };

    fetchData();

    const channel = supabase
      .channel(`messages-${userId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const newMsg = payload.new as Message;
          const isRelevant =
            (newMsg.sender_id === user.id && newMsg.receiver_id === userId) ||
            (newMsg.sender_id === userId && newMsg.receiver_id === user.id);
          
          if (isRelevant) {
            setMessages((prev) => {
              if (prev.some((m) => m.id === newMsg.id)) return prev;
              return [...prev, newMsg];
            });
            if (newMsg.sender_id === userId) {
              supabase.from("messages").update({ is_read: true }).eq("id", newMsg.id);
            }
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, userId]);

  const initialLoadRef = useRef(true);
  
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom(initialLoadRef.current);
      initialLoadRef.current = false;
    }
  }, [messages, scrollToBottom]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      toast({ title: "Ugyldig filtype", description: "Understøttede formater: billeder, videoer, PDF, Word", variant: "destructive" });
      return;
    }

    const maxSize = file.type.startsWith("video/") ? MAX_VIDEO_SIZE : MAX_ATTACHMENT_SIZE;
    if (file.size > maxSize) {
      const maxMB = Math.round(maxSize / (1024 * 1024));
      toast({ title: "Fil er for stor", description: `Maks ${maxMB}MB for denne filtype`, variant: "destructive" });
      return;
    }

    setAttachment(file);
    if (file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setAttachmentPreview(url);
    } else if (file.type.startsWith("video/")) {
      setAttachmentPreview("video");
    } else {
      setAttachmentPreview("file");
    }

    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const clearAttachment = () => {
    if (attachmentPreview && attachmentPreview.startsWith("blob:")) {
      URL.revokeObjectURL(attachmentPreview);
    }
    setAttachment(null);
    setAttachmentPreview(null);
  };

  const uploadAttachment = async (file: File): Promise<string | null> => {
    if (!user) return null;
    const ext = file.name.split(".").pop();
    const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { error } = await supabase.storage.from("chat-attachments").upload(path, file);
    if (error) {
      toast({ title: "Upload fejlede", description: error.message, variant: "destructive" });
      return null;
    }

    const { data } = supabase.storage.from("chat-attachments").getPublicUrl(path);
    return data.publicUrl;
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMessage.trim() && !attachment) || !user || !userId || sending) return;

    const content = newMessage.trim();

    // Validate text if present
    if (content) {
      const validation = messageSchema.safeParse({ content });
      if (!validation.success) {
        toast({ title: "Ugyldig besked", description: validation.error.errors[0]?.message, variant: "destructive" });
        return;
      }
    }

    setSending(true);
    setNewMessage("");

    let attachmentUrl: string | null = null;
    let attachmentType: string | null = null;

    if (attachment) {
      attachmentUrl = await uploadAttachment(attachment);
      if (!attachmentUrl) {
        setSending(false);
        setNewMessage(content);
        return;
      }
      attachmentType = attachment.type;
      clearAttachment();
    }

    const insertData: any = {
      sender_id: user.id,
      receiver_id: userId,
      content: content || "",
    };
    if (attachmentUrl) {
      insertData.attachment_url = attachmentUrl;
      insertData.attachment_type = attachmentType;
    }

    const { error } = await supabase.from("messages").insert(insertData);

    if (error) {
      setNewMessage(content);
      toast({ title: "Kunne ikke sende besked", description: error.message, variant: "destructive" });
    }

    setSending(false);
  };

  const handleEmojiSelect = (emoji: string) => {
    setNewMessage((prev) => prev + emoji);
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString("da-DK", { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return "I dag";
    if (date.toDateString() === yesterday.toDateString()) return "I går";
    return date.toLocaleDateString("da-DK", { day: "numeric", month: "long" });
  };

  const groupedMessages = messages.reduce((groups, message) => {
    const date = new Date(message.created_at).toDateString();
    if (!groups[date]) groups[date] = [];
    groups[date].push(message);
    return groups;
  }, {} as Record<string, Message[]>);

  if (!user) {
    navigate("/auth");
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-card/80 backdrop-blur-lg border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/chat")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          {friend && (
            <button
              onClick={() => navigate(`/user/${friend.user_id}`)}
              className="flex items-center gap-3 flex-1"
            >
              <Avatar
                src={friend.avatar_url || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"}
                alt={friend.name}
                size="md"
                isOnline={friend.is_online}
              />
              <div className="text-left">
                <h1 className="font-semibold text-foreground">{friend.name}</h1>
                <p className="text-xs text-muted-foreground">
                  {friend.is_online ? "Online" : "Offline"}
                </p>
              </div>
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-pulse text-muted-foreground">Indlæser...</div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-muted-foreground">Ingen beskeder endnu. Sig hej! 👋</p>
          </div>
        ) : (
          Object.entries(groupedMessages).map(([date, dateMessages]) => (
            <div key={date} className="space-y-3">
              <div className="flex justify-center">
                <span className="text-xs text-muted-foreground bg-secondary px-3 py-1 rounded-full">
                  {formatDate(dateMessages[0].created_at)}
                </span>
              </div>
              {dateMessages.map((message) => (
                <MessageBubble
                  key={message.id}
                  content={message.content}
                  isMe={message.sender_id === user.id}
                  time={formatTime(message.created_at)}
                  attachmentUrl={message.attachment_url}
                  attachmentType={message.attachment_type}
                />
              ))}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Attachment Preview */}
      {attachment && (
        <div className="px-4 py-2 border-t border-border bg-card/80 backdrop-blur-lg">
          <div className="flex items-center gap-3">
            <div className="relative">
              {attachmentPreview && attachmentPreview.startsWith("blob:") ? (
                <img src={attachmentPreview} alt="Preview" className="h-16 w-16 rounded-xl object-cover" />
              ) : attachmentPreview === "video" ? (
                <div className="h-16 w-16 rounded-xl bg-secondary flex items-center justify-center">
                  <Film className="h-6 w-6 text-muted-foreground" />
                </div>
              ) : (
                <div className="h-16 w-16 rounded-xl bg-secondary flex items-center justify-center">
                  <File className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
              <button
                onClick={clearAttachment}
                className="absolute -top-1.5 -right-1.5 h-5 w-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{attachment.name}</p>
              <p className="text-xs text-muted-foreground">
                {(attachment.size / 1024 / 1024).toFixed(1)} MB
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="sticky bottom-0 bg-card/80 backdrop-blur-lg border-t border-border px-4 py-3">
        <form onSubmit={handleSendMessage} className="flex items-center gap-1.5">
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept={ALLOWED_FILE_TYPES.join(",")}
            onChange={handleFileSelect}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full shrink-0"
            onClick={() => fileInputRef.current?.click()}
          >
            <Paperclip className="h-5 w-5 text-muted-foreground" />
          </Button>
          <EmojiPicker onSelect={handleEmojiSelect} />
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Skriv en besked..."
            className="flex-1 h-12 px-4 rounded-2xl bg-secondary text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <Button
            type="submit"
            variant="gradient"
            size="icon"
            className="h-12 w-12 rounded-2xl shrink-0"
            disabled={(!newMessage.trim() && !attachment) || sending}
          >
            <Send className="h-5 w-5" />
          </Button>
        </form>
      </div>
    </div>
  );
}
