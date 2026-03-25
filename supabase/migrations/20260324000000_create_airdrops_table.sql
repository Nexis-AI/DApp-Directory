CREATE TABLE public.airdrops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    logo_url TEXT,
    rewards TEXT,
    description TEXT,
    url TEXT NOT NULL,
    chain TEXT,
    category TEXT,
    tasks JSONB DEFAULT '[]'::jsonb,
    instructions TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS Policies
ALTER TABLE public.airdrops ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Airdrops are viewable by everyone" ON public.airdrops FOR SELECT USING (true);
CREATE POLICY "Airdrops can be inserted by service role" ON public.airdrops FOR INSERT WITH CHECK (true);
CREATE POLICY "Airdrops can be updated by service role" ON public.airdrops FOR UPDATE USING (true);
