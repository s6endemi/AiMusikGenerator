-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor → New Query)

-- Credits table
CREATE TABLE credits (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    balance INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-update timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER credits_updated_at
    BEFORE UPDATE ON credits
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Generation history (optional, for analytics)
CREATE TABLE generations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    prompt TEXT NOT NULL,
    negative_prompt TEXT DEFAULT '',
    bpm INTEGER,
    mood TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Row Level Security
ALTER TABLE credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE generations ENABLE ROW LEVEL SECURITY;

-- Users can only read their own credits
CREATE POLICY "Users read own credits"
    ON credits FOR SELECT
    USING (auth.uid() = user_id);

-- Service role can do everything (backend uses service role key)
CREATE POLICY "Service role full access credits"
    ON credits FOR ALL
    USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access generations"
    ON generations FOR ALL
    USING (auth.role() = 'service_role');
