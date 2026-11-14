-- QR Shield: Supabase Database Migration
-- Version: 001_init.sql
-- Privacy Rule: Never store raw URLs, message content or phone numbers. Store only SHA-256 salted hashes.

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Scans table
CREATE TYPE input_type_enum AS ENUM ('qr', 'link', 'message', 'upi');
CREATE TYPE verdict_enum AS ENUM ('safe', 'suspicious', 'dangerous');

CREATE TABLE IF NOT EXISTS scans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    input_type input_type_enum NOT NULL,
    content_hash TEXT NOT NULL,
    domain_hash TEXT,
    verdict verdict_enum NOT NULL,
    risk_score INTEGER NOT NULL CHECK (risk_score >= 0 AND risk_score <= 100),
    scam_category VARCHAR(100),
    ai_used BOOLEAN DEFAULT false,
    recommended_action TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Scan signals (explainability: rule or ai, label, detail)
CREATE TYPE signal_source_enum AS ENUM ('rule', 'ai');

CREATE TABLE IF NOT EXISTS scan_signals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scan_id UUID NOT NULL REFERENCES scans(id) ON DELETE CASCADE,
    source signal_source_enum NOT NULL,
    label VARCHAR(255) NOT NULL,
    detail TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Community reports (domain blacklist by hash)
CREATE TABLE IF NOT EXISTS community_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    domain_hash TEXT UNIQUE NOT NULL,
    report_count INTEGER DEFAULT 1,
    first_reported_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_reported_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance & privacy lookups
CREATE INDEX IF NOT EXISTS idx_scans_content_hash ON scans(content_hash);
CREATE INDEX IF NOT EXISTS idx_scans_domain_hash ON scans(domain_hash);
CREATE INDEX IF NOT EXISTS idx_scans_user_id ON scans(user_id);
CREATE INDEX IF NOT EXISTS idx_scans_created_at ON scans(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_reports_domain_hash ON community_reports(domain_hash);
CREATE INDEX IF NOT EXISTS idx_scan_signals_scan_id ON scan_signals(scan_id);
