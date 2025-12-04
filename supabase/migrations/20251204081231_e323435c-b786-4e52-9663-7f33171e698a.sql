-- Add new columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS birthday DATE,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;

-- Create index for username search
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);

-- Create storage bucket for avatars
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for avatar uploads
CREATE POLICY "Avatar images are publicly accessible" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatar" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Add DELETE policy for friendships
CREATE POLICY "Users can delete their own friendships" 
ON public.friendships FOR DELETE 
USING ((auth.uid() = requester_id) OR (auth.uid() = addressee_id));

-- Fix security: Restrict profiles to authenticated users only
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Profiles are viewable by authenticated users" 
ON public.profiles FOR SELECT TO authenticated
USING (true);

-- Fix security: Restrict user_interests to authenticated users only
DROP POLICY IF EXISTS "User interests are viewable by everyone" ON public.user_interests;
CREATE POLICY "User interests are viewable by authenticated users" 
ON public.user_interests FOR SELECT TO authenticated
USING (true);