-- migrate:up

CREATE TYPE users_role AS ENUM('user', 'admin')

CREATE TABLE IF NOT EXISTS users(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    role users_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS urls(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    urls_code VARCHAR(10) NOT NULL UNIQUE,
    users_id UUID REFERENCES users(id) ON DELETE RESTRICT,
    original_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS clicks(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clicked_at TIMESTAMPTZ NOT NULL,
    ip_address TEXT,
    country TEXT,
    urls_id UUID NOT NULL REFERENCES urls(id) ON DELETE CASCADE,
    referrer TEXT,
    browser TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    device TEXT,
    os TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- migrate:down

DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS urls;
DROP TABLE IF EXISTS clicks;
