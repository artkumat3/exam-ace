-- Fix the overly permissive analytics policy by making it auth-aware but still allowing anon
DROP POLICY IF EXISTS "Anyone can track events" ON public.analytics;

-- Allow authenticated users to insert analytics with their user_id
CREATE POLICY "Authenticated users can track events" ON public.analytics 
FOR INSERT 
WITH CHECK (user_id IS NULL OR user_id = auth.uid());

-- Insert default admin user role (will be linked when user signs up with Admin email)
-- We'll handle admin creation through a special edge function