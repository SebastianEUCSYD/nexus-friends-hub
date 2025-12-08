import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useNotifications() {
  const { user } = useAuth();
  const [permission, setPermission] = useState<NotificationPermission>("default");

  useEffect(() => {
    if ("Notification" in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if (!("Notification" in window)) {
      console.log("This browser does not support notifications");
      return false;
    }

    const result = await Notification.requestPermission();
    setPermission(result);
    return result === "granted";
  };

  const showNotification = (title: string, body: string, icon?: string) => {
    if (permission !== "granted") return;
    
    new Notification(title, {
      body,
      icon: icon || "/favicon.ico",
      badge: "/favicon.ico",
    });
  };

  useEffect(() => {
    if (!user || permission !== "granted") return;

    const channel = supabase
      .channel("message-notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `receiver_id=eq.${user.id}`,
        },
        async (payload) => {
          const newMessage = payload.new as { sender_id: string; content: string };
          
          // Fetch sender's name
          const { data: sender } = await supabase
            .from("profiles")
            .select("name, avatar_url")
            .eq("user_id", newMessage.sender_id)
            .maybeSingle();

          if (sender) {
            showNotification(
              sender.name,
              newMessage.content,
              sender.avatar_url || undefined
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, permission]);

  return { permission, requestPermission, showNotification };
}
