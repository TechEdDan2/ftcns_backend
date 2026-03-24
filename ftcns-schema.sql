-- FTCNS Final Schema
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. EVENTS: Stores tournament info from FTC API
CREATE TABLE events (
    event_code VARCHAR(50) PRIMARY KEY, -- e.g., 'USNYLIBAQ'
    region_code VARCHAR(10) NOT NULL,   -- e.g., 'USNYLI'
    event_name VARCHAR(255) NOT NULL,   
    event_date DATE,
    city VARCHAR(100),
    state_prov VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE     -- Helpful for filtering current tournaments
);

-- 2. TEAMS: Stores general team info from FTC API  
CREATE TABLE teams (
    team_number INTEGER PRIMARY KEY,
    team_name VARCHAR(255) NOT NULL,
    rookie_year INTEGER
);

-- 3. EVENT_TEAMS: Bridge table (Many-to-Many) 
-- Populated by fetching the team list for a specific event
-- CREATE TABLE event_teams (
--     event_code VARCHAR(50) REFERENCES events(event_code) ON DELETE CASCADE,
--     team_number INTEGER REFERENCES teams(team_number) ON DELETE CASCADE,
--     -- Performance snapshot update with sync from FTC API
--     event_rank INTEGER,
--     wins INTEGER DEFAULT 0,
--     losses INTEGER DEFAULT 0,
--     ties INTEGER DEFAULT 0,
--     last_api_sync TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     PRIMARY KEY (event_code, team_number)
-- );

-- 4. USERS: App users (Admins and Scouts)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'scout', -- 'admin' or 'scout'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. NOTES: main feature of the scouting app
-- Links a user's observation to a specific team AT a specific event
CREATE TABLE notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_number INTEGER NOT NULL,
    event_code VARCHAR(50) NOT NULL,
    username VARCHAR(50) NOT NULL,
    note_title VARCHAR(255) NOT NULL,
    note_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (team_number) REFERENCES teams(team_number) ON DELETE CASCADE,
    FOREIGN KEY (event_code) REFERENCES events(event_code) ON DELETE CASCADE,
    FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE
);
