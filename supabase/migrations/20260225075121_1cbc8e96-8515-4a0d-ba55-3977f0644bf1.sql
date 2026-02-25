
-- Add attachment columns to messages table
ALTER TABLE public.messages 
ADD COLUMN attachment_url TEXT,
ADD COLUMN attachment_type TEXT;

-- Create storage bucket for chat attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('chat-attachments', 'chat-attachments', true)
ON CONFLICT (id) DO NOTHING;

-- RLS: Authenticated users can upload to chat-attachments
CREATE POLICY "Authenticated users can upload chat attachments"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'chat-attachments');

-- RLS: Anyone can view chat attachments (public bucket)
CREATE POLICY "Chat attachments are publicly viewable"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'chat-attachments');

-- RLS: Users can delete their own uploads
CREATE POLICY "Users can delete their own chat attachments"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'chat-attachments' AND (storage.foldername(name))[1] = auth.uid()::text);
