-- Ensure crypto functions are available
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Use TRUNCATE to clear tables before seeding (prevents unique constraint errors)
TRUNCATE events, teams, users, notes RESTART IDENTITY CASCADE;

-- Seed data for events and teams (these can be expanded with real data from the FTC API)
INSERT INTO events (event_code, region_code, event_name, event_date, city, state_prov, is_active) VALUES
    ('USNYLIPORT', 'USNYLI', 'Long Island Portledge Qualifier', '2014-09-01', 'Locust Valley', 'NY', FALSE);

-- FTCNS Database Seed Script - Populates tables with initial data for testing and development purposes not a real team number, just for testing
INSERT INTO teams (team_number, team_name, rookie_year) VALUES
    (0, 'The J5 Short Circuits', 2014);

-- Note: The team_number 0 is just for testing; in a real scenario, you'd use actual team numbers from the FTC API. POSSIBLE UPDATE IN THE FUTURE. 
-- INSERT INTO event_teams (event_code, team_number, event_rank, wins, losses, ties) VALUES
--     ('USNYLIPORT', 0, 1, 5, 0, 0);

-- Create some users (one admin and two scouts) with hashed passwords
INSERT INTO users (username, password_hash, role) VALUES
    ('admin1', crypt('adminpassword1', gen_salt('bf')), 'admin'),
    ('scout1', crypt('scoutpassword1', gen_salt('bf')), 'scout'),
    ('scout2', crypt('scoutpassword2', gen_salt('bf')), 'scout');

-- Create some notes for testing (linked to the team and event) Seed notes: No need to pass 'id' or 'created_at' if they have defaults
INSERT INTO notes (team_number, event_code, scout_id, note_title, note_text) VALUES
    (0, 'USNYLIPORT', (SELECT id FROM users WHERE username = 'scout1'),'First Round', 'Great performance!'),
    (0, 'USNYLIPORT', (SELECT id FROM users WHERE username = 'scout2'),'Auto Issues', 'Needs work on autonomous.'),
    (0, 'USNYLIPORT', (SELECT id FROM users WHERE username = 'scout1'),'Endgame', 'Strong endgame performance.');

