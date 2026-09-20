-- AcademeNode Database Schema (Postgres / Supabase)
-- Paste this into the Supabase SQL Editor (Project → SQL Editor → New query) and run it.
-- Supabase already provides the database itself, so there's no CREATE DATABASE / USE step.

-- 1. Study Modules Table
-- source_text/gen_count/gen_types/gen_instructions are only set for modules created via
-- the "Generate from File" feature, and let a module's quiz be regenerated later without
-- re-uploading the original file.
CREATE TABLE IF NOT EXISTS modules (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT,
    source_text TEXT,
    gen_count INT,
    gen_types JSONB,
    gen_instructions TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Flashcards / Notes Table linked to Modules
-- question_type: 'flashcard' | 'multiple_choice' | 'situational' | 'true_false'
-- options: JSON array of choice strings, used for 'multiple_choice' (4 options) and
--          'true_false' (always ["True", "False"])
-- rationale: optional 1-3 sentence explanation of why the answer is correct
CREATE TABLE IF NOT EXISTS flashcards (
    id SERIAL PRIMARY KEY,
    module_id INT NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    question_type VARCHAR(30) NOT NULL DEFAULT 'flashcard',
    options JSONB,
    rationale TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Quiz Attempts — score history per module, one row per completed full-deck session
CREATE TABLE IF NOT EXISTS quiz_attempts (
    id SERIAL PRIMARY KEY,
    module_id INT NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
    correct_count INT NOT NULL,
    review_count INT NOT NULL,
    total_count INT NOT NULL,
    score_pct INT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Store Items — redeemable rewards catalog, editable from the Store page
CREATE TABLE IF NOT EXISTS store_items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    cost INT NOT NULL,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Coin Transactions — ledger of coins earned (from quiz scores) and redeemed (store purchases)
-- kind: 'earned' | 'redeemed'. fulfilled tracks whether a redeemed real-world reward has
-- actually been given yet (toggled manually from the Store page).
CREATE TABLE IF NOT EXISTS coin_transactions (
    id SERIAL PRIMARY KEY,
    kind VARCHAR(20) NOT NULL,
    amount INT NOT NULL,
    note TEXT,
    quiz_attempt_id INT REFERENCES quiz_attempts(id) ON DELETE SET NULL,
    store_item_id INT REFERENCES store_items(id) ON DELETE SET NULL,
    fulfilled BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Starter store catalog — edit, delete, or add more anytime from the Store page
INSERT INTO store_items (name, description, cost) VALUES
('Lip tint or lipstick', 'Any shade she''s been eyeing', 40),
('Eyebrow pencil', 'A new brow pencil or pomade', 35),
('Nail polish', 'A cute new nail color', 25),
('Sheet mask / skincare treat', 'A little self-care treat', 20),
('Iced coffee or bubble tea', 'A drink treat, on the house', 15),
('TikTok Shop ₱100 voucher', 'Redeemable for ₱100 of TikTok Shop credit', 60),
('TikTok Shop ₱200 voucher', 'Redeemable for ₱200 of TikTok Shop credit', 120),
('Movie night', 'A movie date or streaming night, her pick', 50);

-- Sample seed data (optional — remove if you want to start empty)
INSERT INTO modules (title, category, description) VALUES
('Data Structures Basics', 'Networking', 'Core concepts of arrays, linked lists, and trees.'),
('Research Ethics 101', 'Research Ethics', 'Fundamentals of ethical conduct in academic research.');

INSERT INTO flashcards (module_id, question, answer) VALUES
(1, 'What is a linked list?', 'A linear data structure where elements are linked using pointers.'),
(1, 'What is Big O notation?', 'A notation describing the upper bound of an algorithm''s time or space complexity.'),
(2, 'What is informed consent?', 'A process ensuring research participants understand and agree to study terms.');
