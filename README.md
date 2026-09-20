# 📖 YslaNotes

Interactive Academic Study Guide & Flashcard Web App — Node.js, Express, Supabase (Postgres), Gemini AI, EJS, Tailwind CSS.

## Features
- Dashboard listing all study modules, with search + category filter
- Create modules manually, or **generate a full quiz from an uploaded PDF/DOCX/TXT file** via Gemini AI (flashcard, multiple-choice, and situational/NCLEX-style questions, with custom instructions and question count)
- Flip-card and multiple-choice review modes, with keyboard shortcuts and a progress bar
- Self-assessment tracker ("Got it right" vs "Needs review")
- **Review Missed** — drill just the questions you got wrong until you master them
- **Exam/Timed mode** — countdown timer that auto-submits when time runs out
- **Quiz history** — every attempt's score is saved and shown per module
- Edit, add, or delete individual questions after generation
- Password-protected (single shared password via session login)

## 1. Install dependencies
```bash
cd academenode
npm install
```

## 2. Set up the database
1. Create a project at [supabase.com](https://supabase.com) (or use an existing one).
2. Open the project's **SQL Editor** and paste in the contents of `schema.sql` — this creates the `modules`, `flashcards`, and `quiz_attempts` tables and adds a couple of sample rows.

## 3. Configure environment variables
Copy `.env.example` to `.env` and fill in your credentials:
```bash
cp .env.example .env
```
```
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GEMINI_API_KEY=your_gemini_api_key
APP_PASSWORD=choose_a_login_password
SESSION_SECRET=any_long_random_string
PORT=3000
```
The Supabase service role key and the login session secret are both sensitive — keep `.env` out of version control.

## 4. Run it
```bash
npm start
```
Visit **http://localhost:3000** and log in with your `APP_PASSWORD`.

For auto-reload during development:
```bash
npm run dev
```

## Project structure
```
academenode/
├── public/
│   ├── css/style.css       # Pink theme, flip-card animation, progress bar, animations
│   └── js/
│       ├── quiz.js         # Flashcard/MC flip, scoring, spaced repetition, exam timer
│       ├── sounds.js        # Web Audio–based UI sound effects (no audio files needed)
│       └── confetti.js      # Lightweight completion-screen confetti burst
├── views/
│   ├── index.ejs            # Dashboard & module list
│   ├── study.ejs             # Quiz/review interface
│   ├── create.ejs            # Manual module creation form
│   ├── generate.ejs          # AI generation upload form
│   ├── manage.ejs            # Edit/add/delete individual questions
│   └── login.ejs             # Password login screen
├── lib/
│   ├── icons.js              # Inline SVG icon set (no emoji, no icon font dependency)
│   ├── extractText.js        # PDF/DOCX/TXT text extraction
│   └── generateQuestions.js  # Gemini prompt + model fallback/retry logic
├── server.js                  # Express app, routes, auth middleware
├── db.js                      # Supabase client
├── schema.sql                  # Database schema (Postgres) + sample data
├── package.json
└── .env.example
```

## API
- `GET /api/flashcards/:moduleId` — returns a module's flashcards as JSON (requires an authenticated session).
