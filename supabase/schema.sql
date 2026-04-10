-- ============================================
-- DotScale Ranker - Supabase Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT DEFAULT '',
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  is_blocked BOOLEAN DEFAULT FALSE,
  last_seen_at TIMESTAMPTZ DEFAULT NOW(),
  total_session_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Searches table
CREATE TABLE IF NOT EXISTS public.searches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  keyword TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Search results table
CREATE TABLE IF NOT EXISTS public.search_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  search_id UUID REFERENCES public.searches(id) ON DELETE CASCADE NOT NULL,
  position INTEGER NOT NULL,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  snippet TEXT DEFAULT ''
);

-- Rank checks table
CREATE TABLE IF NOT EXISTS public.rank_checks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  search_id UUID REFERENCES public.searches(id) ON DELETE CASCADE NOT NULL,
  target_url TEXT NOT NULL,
  is_listed BOOLEAN DEFAULT FALSE,
  position INTEGER,
  feedback TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- API logs table
CREATE TABLE IF NOT EXISTS public.api_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  endpoint TEXT NOT NULL,
  tokens_used INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  is_broadcast BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User sessions table (for live tracking)
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  last_active_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  UNIQUE(user_id)
);

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS idx_searches_user_id ON public.searches(user_id);
CREATE INDEX IF NOT EXISTS idx_searches_created_at ON public.searches(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_search_results_search_id ON public.search_results(search_id);
CREATE INDEX IF NOT EXISTS idx_rank_checks_search_id ON public.rank_checks(search_id);
CREATE INDEX IF NOT EXISTS idx_api_logs_user_id ON public.api_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_api_logs_created_at ON public.api_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_is_active ON public.user_sessions(is_active);

-- ============================================
-- RLS Policies
-- ============================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rank_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies (in case of re-run)
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, pol.tablename);
  END LOOP;
END $$;

-- Create a security definer function to avoid infinite recursion on RLS
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT role = 'admin' FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- =====================
-- Profiles policies
-- =====================
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_select_admin" ON public.profiles FOR SELECT USING (
  public.is_admin()
);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_update_admin" ON public.profiles FOR UPDATE USING (
  public.is_admin()
);
CREATE POLICY "profiles_insert" ON public.profiles FOR INSERT WITH CHECK (true);

-- =====================
-- Searches policies
-- =====================
CREATE POLICY "searches_all_own" ON public.searches FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "searches_select_admin" ON public.searches FOR SELECT USING (
  public.is_admin()
);

-- =====================
-- Search results policies
-- =====================
CREATE POLICY "search_results_select" ON public.search_results FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.searches WHERE id = search_id AND user_id = auth.uid())
);
CREATE POLICY "search_results_insert" ON public.search_results FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.searches WHERE id = search_id AND user_id = auth.uid())
);
CREATE POLICY "search_results_select_admin" ON public.search_results FOR SELECT USING (
  public.is_admin()
);

-- =====================
-- Rank checks policies
-- =====================
CREATE POLICY "rank_checks_all_own" ON public.rank_checks FOR ALL USING (
  EXISTS (SELECT 1 FROM public.searches WHERE id = search_id AND user_id = auth.uid())
);
CREATE POLICY "rank_checks_insert" ON public.rank_checks FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.searches WHERE id = search_id AND user_id = auth.uid())
);

-- =====================
-- API logs policies
-- =====================
CREATE POLICY "api_logs_insert_own" ON public.api_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "api_logs_select_own" ON public.api_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "api_logs_select_admin" ON public.api_logs FOR SELECT USING (
  public.is_admin()
);

-- =====================
-- Notifications policies
-- =====================
CREATE POLICY "notifications_select_own" ON public.notifications FOR SELECT USING (
  user_id = auth.uid() OR is_broadcast = TRUE
);
CREATE POLICY "notifications_update_own" ON public.notifications FOR UPDATE USING (
  user_id = auth.uid() OR is_broadcast = TRUE
);
CREATE POLICY "notifications_insert_admin" ON public.notifications FOR INSERT WITH CHECK (
  public.is_admin()
);

-- =====================
-- User sessions policies
-- =====================
CREATE POLICY "sessions_all_own" ON public.user_sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "sessions_select_admin" ON public.user_sessions FOR SELECT USING (
  public.is_admin()
);

-- ============================================
-- Triggers
-- ============================================

-- Auto-create profile on user signup
-- Automatically sets role to 'admin' for admin@dotscale.com
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    CASE WHEN NEW.email = 'admin@dotscale.com' THEN 'admin' ELSE 'user' END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update updated_at on profile changes
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_profile_updated ON public.profiles;
CREATE TRIGGER on_profile_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Track total time spent via last_seen_at heartbeat differences
CREATE OR REPLACE FUNCTION public.update_session_duration()
RETURNS TRIGGER AS $$
DECLARE
  diff_seconds INTEGER;
BEGIN
  IF NEW.last_seen_at > OLD.last_seen_at THEN
    diff_seconds := EXTRACT(EPOCH FROM (NEW.last_seen_at - OLD.last_seen_at));
    -- Only add continuous time (e.g. heartbeat is 1 min, so anything < 5 min is continuous)
    IF diff_seconds < 300 THEN
      NEW.total_session_seconds = COALESCE(OLD.total_session_seconds, 0) + diff_seconds;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_profile_last_seen_updated ON public.profiles;
CREATE TRIGGER on_profile_last_seen_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  WHEN (NEW.last_seen_at IS DISTINCT FROM OLD.last_seen_at)
  EXECUTE FUNCTION public.update_session_duration();
