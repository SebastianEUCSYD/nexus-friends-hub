-- Create activity invitations table
CREATE TABLE public.activity_invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL,
  receiver_id UUID NOT NULL,
  activity_title TEXT NOT NULL,
  activity_icon TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.activity_invitations ENABLE ROW LEVEL SECURITY;

-- Users can send invitations
CREATE POLICY "Users can send activity invitations"
ON public.activity_invitations FOR INSERT
WITH CHECK (auth.uid() = sender_id);

-- Users can view their own invitations
CREATE POLICY "Users can view their invitations"
ON public.activity_invitations FOR SELECT
USING ((auth.uid() = sender_id) OR (auth.uid() = receiver_id));

-- Users can update their received invitations (mark as read)
CREATE POLICY "Users can update received invitations"
ON public.activity_invitations FOR UPDATE
USING (auth.uid() = receiver_id);

-- Users can delete their invitations
CREATE POLICY "Users can delete their invitations"
ON public.activity_invitations FOR DELETE
USING ((auth.uid() = sender_id) OR (auth.uid() = receiver_id));

-- Enable realtime for activity_invitations
ALTER PUBLICATION supabase_realtime ADD TABLE public.activity_invitations;