-- Create user_airdrops table
CREATE TABLE public.user_airdrops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    airdrop_id UUID NOT NULL REFERENCES public.airdrops(id) ON DELETE CASCADE,
    evm_wallet_address TEXT,
    solana_wallet_address TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'verified')),
    tokens_received NUMERIC DEFAULT 0,
    received_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, airdrop_id)
);

-- RLS Policies
ALTER TABLE public.user_airdrops ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own airdrop tracks" 
ON public.user_airdrops 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own airdrop tracks" 
ON public.user_airdrops 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own airdrop tracks" 
ON public.user_airdrops 
FOR UPDATE 
USING (auth.uid() = user_id);
