-- Supabase Database Migration Script for Identity Finder
-- This script creates the necessary tables and functions for the Identity Finder application

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types/enums
CREATE TYPE card_status AS ENUM ('active', 'claimed', 'expired');
CREATE TYPE match_status AS ENUM ('pending', 'confirmed', 'rejected');
CREATE TYPE user_level AS ENUM ('Bronze', 'Silver', 'Gold', 'Platinum');

-- Create users table (extends Supabase auth.users)
CREATE TABLE public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    name TEXT,
    phone TEXT,
    occupation TEXT,
    bio TEXT,
    photo_url TEXT,
    social_links JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL
);

-- Create reported_cards table
CREATE TABLE public.reported_cards (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    card_type TEXT NOT NULL,
    full_name TEXT NOT NULL,
    phone_number TEXT,
    email TEXT,
    id_number TEXT,
    date_lost DATE,
    location_lost TEXT,
    additional_info TEXT,
    status card_status DEFAULT 'active' NOT NULL,
    reported_by UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create found_cards table
CREATE TABLE public.found_cards (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    card_type TEXT NOT NULL,
    full_name TEXT,
    phone_number TEXT,
    email TEXT,
    id_number TEXT,
    date_found DATE,
    location_found TEXT,
    additional_info TEXT,
    status card_status DEFAULT 'active' NOT NULL,
    found_by UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    claimed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create user_rewards table
CREATE TABLE public.user_rewards (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    points INTEGER DEFAULT 0 NOT NULL,
    level user_level DEFAULT 'Bronze' NOT NULL,
    badges TEXT[] DEFAULT '{}',
    achievements JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create matches table for linking reported and found cards
CREATE TABLE public.matches (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    reported_card_id UUID REFERENCES public.reported_cards(id) ON DELETE CASCADE NOT NULL,
    found_card_id UUID REFERENCES public.found_cards(id) ON DELETE CASCADE NOT NULL,
    match_score DECIMAL(3,2) DEFAULT 0.00 NOT NULL,
    status match_status DEFAULT 'pending' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(reported_card_id, found_card_id)
);

-- Create indexes for better performance
CREATE INDEX idx_reported_cards_reported_by ON public.reported_cards(reported_by);
CREATE INDEX idx_reported_cards_status ON public.reported_cards(status);
CREATE INDEX idx_reported_cards_card_type ON public.reported_cards(card_type);
CREATE INDEX idx_reported_cards_created_at ON public.reported_cards(created_at DESC);

CREATE INDEX idx_found_cards_found_by ON public.found_cards(found_by);
CREATE INDEX idx_found_cards_status ON public.found_cards(status);
CREATE INDEX idx_found_cards_card_type ON public.found_cards(card_type);
CREATE INDEX idx_found_cards_created_at ON public.found_cards(created_at DESC);

CREATE INDEX idx_matches_reported_card_id ON public.matches(reported_card_id);
CREATE INDEX idx_matches_found_card_id ON public.matches(found_card_id);
CREATE INDEX idx_matches_status ON public.matches(status);

CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_is_active ON public.users(is_active);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reported_cards_updated_at
    BEFORE UPDATE ON public.reported_cards
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_found_cards_updated_at
    BEFORE UPDATE ON public.found_cards
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_rewards_updated_at
    BEFORE UPDATE ON public.user_rewards
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_matches_updated_at
    BEFORE UPDATE ON public.matches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create user profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, name, photo_url)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        COALESCE(
            NEW.raw_user_meta_data->>'avatar_url',
            NEW.raw_user_meta_data->>'picture'
        )
    );

    -- Create initial user rewards entry
    INSERT INTO public.user_rewards (user_id, points, level)
    VALUES (NEW.id, 0, 'Bronze');

    RETURN NEW;
EXCEPTION
    WHEN unique_violation THEN
        -- User already exists, skip
        RETURN NEW;
END;
$$ language plpgsql security definer;

-- Trigger to create user profile on signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reported_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.found_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can view all profiles" ON public.users
    FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Reported cards policies
CREATE POLICY "Anyone can view reported cards" ON public.reported_cards
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own reported cards" ON public.reported_cards
    FOR INSERT WITH CHECK (auth.uid() = reported_by);

CREATE POLICY "Users can update their own reported cards" ON public.reported_cards
    FOR UPDATE USING (auth.uid() = reported_by);

CREATE POLICY "Users can delete their own reported cards" ON public.reported_cards
    FOR DELETE USING (auth.uid() = reported_by);

-- Found cards policies
CREATE POLICY "Anyone can view found cards" ON public.found_cards
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own found cards" ON public.found_cards
    FOR INSERT WITH CHECK (auth.uid() = found_by);

CREATE POLICY "Users can update their own found cards" ON public.found_cards
    FOR UPDATE USING (auth.uid() = found_by);

CREATE POLICY "Users can delete their own found cards" ON public.found_cards
    FOR DELETE USING (auth.uid() = found_by);

-- User rewards policies
CREATE POLICY "Users can view all rewards" ON public.user_rewards
    FOR SELECT USING (true);

CREATE POLICY "Users can update own rewards" ON public.user_rewards
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can insert rewards" ON public.user_rewards
    FOR INSERT WITH CHECK (true);

-- Matches policies
CREATE POLICY "Users can view matches for their cards" ON public.matches
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.reported_cards
            WHERE id = reported_card_id AND reported_by = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM public.found_cards
            WHERE id = found_card_id AND found_by = auth.uid()
        )
    );

CREATE POLICY "System can manage matches" ON public.matches
    FOR ALL USING (true);

-- Function to calculate match score between reported and found cards
CREATE OR REPLACE FUNCTION calculate_match_score(
    reported_card_id UUID,
    found_card_id UUID
)
RETURNS DECIMAL AS $$
DECLARE
    score DECIMAL := 0.00;
    r_card RECORD;
    f_card RECORD;
BEGIN
    -- Get reported card details
    SELECT * INTO r_card FROM public.reported_cards WHERE id = reported_card_id;

    -- Get found card details
    SELECT * INTO f_card FROM public.found_cards WHERE id = found_card_id;

    -- Return 0 if either card doesn't exist
    IF r_card IS NULL OR f_card IS NULL THEN
        RETURN 0.00;
    END IF;

    -- Calculate score based on matching criteria
    IF r_card.card_type = f_card.card_type THEN
        score := score + 0.30; -- 30% for matching card type
    END IF;

    IF LOWER(r_card.full_name) = LOWER(f_card.full_name) THEN
        score := score + 0.40; -- 40% for exact name match
    ELSIF LOWER(r_card.full_name) LIKE '%' || LOWER(f_card.full_name) || '%'
          OR LOWER(f_card.full_name) LIKE '%' || LOWER(r_card.full_name) || '%' THEN
        score := score + 0.20; -- 20% for partial name match
    END IF;

    IF r_card.id_number = f_card.id_number AND r_card.id_number IS NOT NULL AND f_card.id_number IS NOT NULL THEN
        score := score + 0.25; -- 25% for matching ID number
    END IF;

    IF r_card.phone_number = f_card.phone_number AND r_card.phone_number IS NOT NULL AND f_card.phone_number IS NOT NULL THEN
        score := score + 0.05; -- 5% for matching phone
    END IF;

    RETURN LEAST(score, 1.00); -- Cap at 1.00
END;
$$ LANGUAGE plpgsql;

-- Function to find potential matches for a reported card
CREATE OR REPLACE FUNCTION find_potential_matches(reported_id UUID)
RETURNS TABLE(
    found_card_id UUID,
    match_score DECIMAL,
    card_title TEXT,
    full_name TEXT,
    card_type TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        fc.id,
        calculate_match_score(reported_id, fc.id) as score,
        fc.title,
        fc.full_name,
        fc.card_type
    FROM public.found_cards fc
    WHERE fc.status = 'active'
    AND calculate_match_score(reported_id, fc.id) > 0.30
    ORDER BY score DESC
    LIMIT 10;
END;
$$ LANGUAGE plpgsql;

-- Function to update user level based on points
CREATE OR REPLACE FUNCTION update_user_level(user_id UUID)
RETURNS void AS $$
DECLARE
    user_points INTEGER;
    new_level user_level;
BEGIN
    -- Get current points
    SELECT points INTO user_points
    FROM public.user_rewards
    WHERE user_rewards.user_id = update_user_level.user_id;

    -- Return early if no rewards record exists
    IF user_points IS NULL THEN
        RETURN;
    END IF;

    -- Determine new level based on points
    IF user_points >= 10000 THEN
        new_level := 'Platinum';
    ELSIF user_points >= 5000 THEN
        new_level := 'Gold';
    ELSIF user_points >= 1000 THEN
        new_level := 'Silver';
    ELSE
        new_level := 'Bronze';
    END IF;

    -- Update level
    UPDATE public.user_rewards
    SET level = new_level
    WHERE user_rewards.user_id = update_user_level.user_id;
END;
$$ LANGUAGE plpgsql;

-- Function to award points to user
CREATE OR REPLACE FUNCTION award_points(user_id UUID, points INTEGER, reason TEXT DEFAULT NULL)
RETURNS void AS $$
BEGIN
    -- Insert or update user rewards
    INSERT INTO public.user_rewards (user_id, points)
    VALUES (user_id, points)
    ON CONFLICT (user_id)
    DO UPDATE SET
        points = user_rewards.points + EXCLUDED.points,
        updated_at = timezone('utc'::text, now());

    -- Update user level
    PERFORM update_user_level(user_id);
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Grant select access to anon users for public data
GRANT SELECT ON public.users TO anon;
GRANT SELECT ON public.reported_cards TO anon;
GRANT SELECT ON public.found_cards TO anon;

-- Comments for documentation
COMMENT ON TABLE public.users IS 'User profiles extending Supabase auth.users';
COMMENT ON TABLE public.reported_cards IS 'Cards reported as lost by users';
COMMENT ON TABLE public.found_cards IS 'Cards found and reported by users';
COMMENT ON TABLE public.user_rewards IS 'User reward points and achievements';
COMMENT ON TABLE public.matches IS 'Potential matches between reported and found cards';

COMMENT ON FUNCTION calculate_match_score IS 'Calculates similarity score between reported and found cards';
COMMENT ON FUNCTION find_potential_matches IS 'Finds potential matches for a reported card';
COMMENT ON FUNCTION award_points IS 'Awards points to users and updates their level';
COMMENT ON FUNCTION public.handle_new_user IS 'Automatically creates user profile when user signs up';

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Identity Finder database migration completed successfully!';
    RAISE NOTICE 'Tables created: users, reported_cards, found_cards, user_rewards, matches';
    RAISE NOTICE 'Functions created: calculate_match_score, find_potential_matches, award_points, handle_new_user';
    RAISE NOTICE 'Triggers created: Auto user profile creation, timestamp updates';
    RAISE NOTICE 'Security: Row Level Security policies enabled';
END $$;
