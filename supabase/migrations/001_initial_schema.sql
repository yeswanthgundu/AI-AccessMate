-- ==============================================================================
-- AI AccessMate — Initial Database Schema & RLS Policies
-- Supabase Cloud PostgreSQL Migration 001
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    ability_profile VARCHAR(50) DEFAULT 'default',
    preferred_language VARCHAR(50) DEFAULT 'English',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Preferences Table
CREATE TABLE IF NOT EXISTS preferences (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    font_size VARCHAR(20) DEFAULT 'medium',
    high_contrast BOOLEAN DEFAULT FALSE,
    speech_speed DECIMAL(3,2) DEFAULT 1.00,
    language VARCHAR(50) DEFAULT 'English',
    ability_profile VARCHAR(50) DEFAULT 'default',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. History Table
CREATE TABLE IF NOT EXISTS history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    feature VARCHAR(100) NOT NULL,
    input_payload TEXT NOT NULL,
    output_payload JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_history_user_id ON history(user_id);
CREATE INDEX IF NOT EXISTS idx_history_feature ON history(feature);
CREATE INDEX IF NOT EXISTS idx_history_created_at ON history(created_at DESC);

-- ==============================================================================
-- Row Level Security (RLS) Policies
-- ==============================================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE history ENABLE ROW LEVEL SECURITY;

-- Allow public service-role full access for backend API operations
DROP POLICY IF EXISTS service_role_users_policy ON users;
CREATE POLICY service_role_users_policy ON users
    USING (auth.role() = 'service_role' OR current_setting('request.jwt.claim.role', true) = 'service_role')
    WITH CHECK (auth.role() = 'service_role' OR current_setting('request.jwt.claim.role', true) = 'service_role');

DROP POLICY IF EXISTS service_role_preferences_policy ON preferences;
CREATE POLICY service_role_preferences_policy ON preferences
    USING (auth.role() = 'service_role' OR current_setting('request.jwt.claim.role', true) = 'service_role')
    WITH CHECK (auth.role() = 'service_role' OR current_setting('request.jwt.claim.role', true) = 'service_role');

DROP POLICY IF EXISTS service_role_history_policy ON history;
CREATE POLICY service_role_history_policy ON history
    USING (auth.role() = 'service_role' OR current_setting('request.jwt.claim.role', true) = 'service_role')
    WITH CHECK (auth.role() = 'service_role' OR current_setting('request.jwt.claim.role', true) = 'service_role');

-- User Data Isolation Policies (for user JWT claims)
DROP POLICY IF EXISTS user_isolation_policy ON users;
CREATE POLICY user_isolation_policy ON users
    USING (
        id = NULLIF(current_setting('request.jwt.claim.sub', true), '')::uuid 
        OR auth.uid() = id
    );

DROP POLICY IF EXISTS preference_isolation_policy ON preferences;
CREATE POLICY preference_isolation_policy ON preferences
    USING (
        user_id = NULLIF(current_setting('request.jwt.claim.sub', true), '')::uuid
        OR auth.uid() = user_id
    );

DROP POLICY IF EXISTS history_isolation_policy ON history;
CREATE POLICY history_isolation_policy ON history
    USING (
        user_id = NULLIF(current_setting('request.jwt.claim.sub', true), '')::uuid
        OR auth.uid() = user_id
    );

-- ==============================================================================
-- Seed Data: Sample Demo User and Interaction Records
-- ==============================================================================

-- Demo User: demo@accessmate.ai / Demo1234! (bcrypt hash)
INSERT INTO users (id, name, email, password_hash, ability_profile, preferred_language)
VALUES (
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    'Aarav Sharma',
    'demo@accessmate.ai',
    '$2b$10$1WL.C9pnW.d7EoyhvDqj5.0WQaQkWSDo.i0MGjEM3RY4FM0jq7Qwu',
    'dyslexia',
    'Telugu'
) ON CONFLICT (email) DO NOTHING;

INSERT INTO preferences (user_id, font_size, high_contrast, speech_speed, language, ability_profile)
VALUES (
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    'large',
    TRUE,
    0.90,
    'Telugu',
    'dyslexia'
) ON CONFLICT (user_id) DO NOTHING;

INSERT INTO history (user_id, feature, input_payload, output_payload)
VALUES (
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    'simplifier',
    'The beneficiary must furnish an affidavit attesting to indigent status prior to disbursement of subsidies.',
    '{"originalText": "The beneficiary must furnish an affidavit attesting to indigent status prior to disbursement of subsidies.", "simplifiedText": "You need to submit a signed paper proving you need financial help before you get the money.", "readingLevel": "Grade 3", "readabilityScoreBefore": 28.5, "readabilityScoreAfter": 86.4}'::jsonb
) ON CONFLICT DO NOTHING;
