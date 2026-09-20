// server.js — Main Express server and route handlers
require('dotenv').config();
const express = require('express');
const path = require('path');
const multer = require('multer');
const session = require('express-session');
const rateLimit = require('express-rate-limit');
const supabase = require('./db');
const extractText = require('./lib/extractText');
const generateQuestions = require('./lib/generateQuestions');
const { QUESTION_TYPES } = generateQuestions;
const icon = require('./lib/icons');
const { computeDashboardStats } = require('./lib/stats');

if (!process.env.APP_PASSWORD || !process.env.SESSION_SECRET) {
  throw new Error('Missing APP_PASSWORD or SESSION_SECRET in .env');
}

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

// Trust Render's (or any) reverse proxy so secure cookies and req.secure work correctly
if (isProduction) app.set('trust proxy', 1);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ok = /\.(pdf|docx|txt)$/i.test(file.originalname);
    cb(ok ? null : new Error('Only .pdf, .docx, and .txt files are supported.'), ok);
  }
});

// ---------- Middleware ----------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.locals.icon = icon;

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    httpOnly: true,
    secure: isProduction // only send the session cookie over HTTPS in production
  }
}));

// ---------- Auth ----------

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many login attempts. Please try again in 15 minutes.'
});

app.get('/login', (req, res) => {
  res.render('login', { error: req.query.error === '1' });
});

app.post('/login', loginLimiter, (req, res) => {
  if (req.body.password && req.body.password === process.env.APP_PASSWORD) {
    req.session.authenticated = true;
    return res.redirect('/');
  }
  res.redirect('/login?error=1');
});

app.post('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/login'));
});

app.use((req, res, next) => {
  if (req.session && req.session.authenticated) return next();
  if (req.path.startsWith('/api/')) return res.status(401).json({ error: 'Unauthorized' });
  res.redirect('/login');
});

// ---------- Routes ----------

// .or() filters use a raw PostgREST DSL string, where commas/parens are syntax —
// strip them from user search input so they can't break or redirect the filter.
function sanitizeForOrFilter(value) {
  return value.replace(/[,()]/g, ' ').trim();
}

// GET / — Dashboard: list all modules (matching title OR any flashcard's question/answer),
// with optional category filter, plus streak/score stats from quiz history
app.get('/', async (req, res) => {
  try {
    const { q, category } = req.query;
    const searchTerm = sanitizeForOrFilter(q || '');

    let matchingModuleIds = [];
    if (searchTerm) {
      const { data: matchingCards, error: cardSearchError } = await supabase
        .from('flashcards')
        .select('module_id')
        .or(`question.ilike.%${searchTerm}%,answer.ilike.%${searchTerm}%`);
      if (cardSearchError) throw cardSearchError;
      matchingModuleIds = [...new Set(matchingCards.map(c => c.module_id))];
    }

    let query = supabase.from('modules').select('*');
    if (searchTerm) {
      query = matchingModuleIds.length > 0
        ? query.or(`title.ilike.%${searchTerm}%,id.in.(${matchingModuleIds.join(',')})`)
        : query.ilike('title', `%${searchTerm}%`);
    }
    if (category) {
      query = query.eq('category', category);
    }
    query = query.order('created_at', { ascending: false });

    const { data: modules, error: modulesError } = await query;
    if (modulesError) throw modulesError;

    const { data: allModules, error: categoriesError } = await supabase
      .from('modules')
      .select('id, category');
    if (categoriesError) throw categoriesError;

    const categories = [...new Set(allModules.map(r => r.category))].sort();
    const moduleCategoryMap = new Map(allModules.map(m => [m.id, m.category]));

    const { data: allAttempts, error: attemptsError } = await supabase
      .from('quiz_attempts')
      .select('score_pct, module_id, created_at');
    if (attemptsError) throw attemptsError;

    const stats = computeDashboardStats(allAttempts, moduleCategoryMap);

    res.render('index', {
      modules,
      categories,
      query: q || '',
      selectedCategory: category || '',
      stats
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading dashboard: ' + err.message);
  }
});

// GET /create — Show the "add new module + flashcards" form
app.get('/create', (req, res) => {
  res.render('create');
});

// POST /modules — Create a new module with its flashcards
app.post('/modules', async (req, res) => {
  const { title, category, description, questions, answers } = req.body;

  if (!title || !category) {
    return res.status(400).send('Title and category are required.');
  }

  try {
    const { data: module, error: moduleError } = await supabase
      .from('modules')
      .insert({ title, category, description: description || '' })
      .select()
      .single();
    if (moduleError) throw moduleError;

    const moduleId = module.id;

    // questions/answers arrive as arrays (or single values) from the dynamic form
    const qArr = Array.isArray(questions) ? questions : [questions].filter(Boolean);
    const aArr = Array.isArray(answers) ? answers : [answers].filter(Boolean);

    const flashcardRows = [];
    for (let i = 0; i < qArr.length; i++) {
      if (qArr[i] && aArr[i]) {
        flashcardRows.push({ module_id: moduleId, question: qArr[i], answer: aArr[i] });
      }
    }

    if (flashcardRows.length > 0) {
      const { error: flashcardsError } = await supabase.from('flashcards').insert(flashcardRows);
      if (flashcardsError) {
        // best-effort rollback since supabase-js has no cross-table transaction
        await supabase.from('modules').delete().eq('id', moduleId);
        throw flashcardsError;
      }
    }

    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error creating module: ' + err.message);
  }
});

// GET /generate — Show the "upload a file to auto-generate questions" form
app.get('/generate', (req, res) => {
  res.render('generate', { error: null });
});

// POST /generate — Extract text from the upload, ask Gemini to write questions, save as a new module
app.post('/generate', (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) return res.status(400).render('generate', { error: err.message });
    next();
  });
}, async (req, res) => {
  try {
    const { title, category, count, types, instructions } = req.body;

    if (!req.file) {
      return res.status(400).render('generate', { error: 'Please choose a file to upload.' });
    }
    if (!title || !category) {
      return res.status(400).render('generate', { error: 'Title and category are required.' });
    }

    const typeArr = Array.isArray(types) ? types : [types].filter(Boolean);
    if (typeArr.length === 0) {
      return res.status(400).render('generate', { error: 'Pick at least one question type.' });
    }

    const sourceText = await extractText(req.file.buffer, req.file.originalname);
    if (!sourceText || !sourceText.trim()) {
      return res.status(400).render('generate', { error: 'No readable text could be extracted from that file.' });
    }
    const truncatedSourceText = sourceText.slice(0, generateQuestions.MAX_SOURCE_CHARS);
    const genCount = Math.min(Math.max(Number(count) || 15, 1), 100);

    const generated = await generateQuestions({
      sourceText: truncatedSourceText,
      count: genCount,
      types: typeArr,
      instructions: instructions || ''
    });

    const { data: module, error: moduleError } = await supabase
      .from('modules')
      .insert({
        title,
        category,
        description: instructions || `Auto-generated from ${req.file.originalname}`,
        source_text: truncatedSourceText,
        gen_count: genCount,
        gen_types: typeArr,
        gen_instructions: instructions || null
      })
      .select()
      .single();
    if (moduleError) throw moduleError;

    const flashcardRows = generated.map(q => ({
      module_id: module.id,
      question: q.question,
      answer: q.answer,
      question_type: q.question_type,
      options: q.options,
      rationale: q.rationale
    }));

    const { error: flashcardsError } = await supabase.from('flashcards').insert(flashcardRows);
    if (flashcardsError) {
      await supabase.from('modules').delete().eq('id', module.id);
      throw flashcardsError;
    }

    res.redirect(`/study/${module.id}`);
  } catch (err) {
    console.error(err);
    res.status(500).render('generate', { error: err.message });
  }
});

// GET /study/:moduleId — Interactive flashcard review interface
app.get('/study/:moduleId', async (req, res) => {
  try {
    const { moduleId } = req.params;
    const { data: module, error: moduleError } = await supabase
      .from('modules')
      .select('*')
      .eq('id', moduleId)
      .maybeSingle();
    if (moduleError) throw moduleError;

    if (!module) {
      return res.status(404).send('Module not found.');
    }

    const { data: flashcards, error: flashcardsError } = await supabase
      .from('flashcards')
      .select('*')
      .eq('module_id', moduleId)
      .order('id', { ascending: true });
    if (flashcardsError) throw flashcardsError;

    const { data: attempts, error: attemptsError } = await supabase
      .from('quiz_attempts')
      .select('*')
      .eq('module_id', moduleId)
      .order('created_at', { ascending: false })
      .limit(10);
    if (attemptsError) throw attemptsError;

    res.render('study', { module, flashcards, canRegenerate: !!module.source_text, attempts });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading study module: ' + err.message);
  }
});

// GET /modules/:id/print — Printable/PDF-exportable view of a module's questions
app.get('/modules/:id/print', async (req, res) => {
  try {
    const { id } = req.params;
    const { data: module, error: moduleError } = await supabase
      .from('modules')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (moduleError) throw moduleError;
    if (!module) {
      return res.status(404).send('Module not found.');
    }

    const { data: flashcards, error: flashcardsError } = await supabase
      .from('flashcards')
      .select('*')
      .eq('module_id', id)
      .order('id', { ascending: true });
    if (flashcardsError) throw flashcardsError;

    res.render('print', { module, flashcards });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading printable view: ' + err.message);
  }
});

// POST /modules/:id/attempts — Record a completed full-deck quiz attempt's score
app.post('/modules/:id/attempts', async (req, res) => {
  try {
    const { id } = req.params;
    const correct = Number(req.body.correct) || 0;
    const review = Number(req.body.review) || 0;
    const total = Number(req.body.total) || (correct + review);

    if (total <= 0) {
      return res.status(400).json({ error: 'Invalid attempt totals.' });
    }

    const scorePct = Math.round((correct / total) * 100);

    const { data, error } = await supabase
      .from('quiz_attempts')
      .insert({
        module_id: id,
        correct_count: correct,
        review_count: review,
        total_count: total,
        score_pct: scorePct
      })
      .select()
      .single();
    if (error) throw error;

    res.status(201).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// POST /modules/:id/regenerate — Re-run generation on the module's saved source text for a fresh quiz
app.post('/modules/:id/regenerate', async (req, res) => {
  try {
    const { id } = req.params;
    const { data: module, error: moduleError } = await supabase
      .from('modules')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (moduleError) throw moduleError;

    if (!module) {
      return res.status(404).send('Module not found.');
    }
    if (!module.source_text) {
      return res.status(400).send('This module was not generated from a file, so it has no source material to regenerate from.');
    }

    const generated = await generateQuestions({
      sourceText: module.source_text,
      count: Math.min(Math.max(module.gen_count || 15, 1), 100),
      types: module.gen_types && module.gen_types.length ? module.gen_types : ['flashcard'],
      instructions: module.gen_instructions || ''
    });

    const { error: deleteError } = await supabase.from('flashcards').delete().eq('module_id', id);
    if (deleteError) throw deleteError;

    const flashcardRows = generated.map(q => ({
      module_id: id,
      question: q.question,
      answer: q.answer,
      question_type: q.question_type,
      options: q.options,
      rationale: q.rationale
    }));

    const { error: insertError } = await supabase.from('flashcards').insert(flashcardRows);
    if (insertError) throw insertError;

    res.redirect(`/study/${id}`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error regenerating quiz: ' + err.message);
  }
});

// GET /modules/:id/edit — Manage (edit/delete/add) an existing module's questions
app.get('/modules/:id/edit', async (req, res) => {
  try {
    const { id } = req.params;
    const { data: module, error: moduleError } = await supabase
      .from('modules')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (moduleError) throw moduleError;
    if (!module) {
      return res.status(404).send('Module not found.');
    }

    const { data: flashcards, error: flashcardsError } = await supabase
      .from('flashcards')
      .select('*')
      .eq('module_id', id)
      .order('id', { ascending: true });
    if (flashcardsError) throw flashcardsError;

    res.render('manage', { module, flashcards, error: null });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading module for editing: ' + err.message);
  }
});

function parseOptionsField(optionsText) {
  if (!optionsText) return null;
  const lines = optionsText.split('\n').map(l => l.trim()).filter(Boolean);
  return lines.length > 0 ? lines : null;
}

// Validates/normalizes question_type + options + answer together, since true_false
// has fixed options and multiple_choice needs the answer to match one of its options.
function resolveQuestionTypeFields(question_type, options, answer) {
  const type = QUESTION_TYPES.includes(question_type) ? question_type : 'flashcard';

  if (type === 'true_false') {
    if (answer !== 'True' && answer !== 'False') {
      return { error: 'True/False questions need the answer to be exactly "True" or "False".' };
    }
    return { type, options: ['True', 'False'] };
  }

  if (type === 'multiple_choice') {
    const parsedOptions = parseOptionsField(options);
    if (!parsedOptions || parsedOptions.length < 2) {
      return { error: 'Multiple choice questions need at least 2 options (one per line).' };
    }
    if (!parsedOptions.includes(answer)) {
      return { error: 'The answer must exactly match one of the options, word-for-word.' };
    }
    return { type, options: parsedOptions };
  }

  return { type, options: null };
}

// POST /flashcards/:id/update — Save edits to a single question
app.post('/flashcards/:id/update', async (req, res) => {
  const { id } = req.params;
  const { module_id, question, answer, question_type, options, rationale } = req.body;

  try {
    if (!question || !answer) {
      return res.status(400).send('Question and answer are required.');
    }

    const resolved = resolveQuestionTypeFields(question_type, options, answer);
    if (resolved.error) {
      return res.status(400).send(resolved.error);
    }

    const { error } = await supabase
      .from('flashcards')
      .update({
        question,
        answer,
        question_type: resolved.type,
        options: resolved.options,
        rationale: rationale || null
      })
      .eq('id', id);
    if (error) throw error;

    res.redirect(`/modules/${module_id}/edit`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error updating question: ' + err.message);
  }
});

// POST /flashcards/:id/delete — Remove a single question from its module
app.post('/flashcards/:id/delete', async (req, res) => {
  const { id } = req.params;
  const { module_id } = req.body;
  try {
    const { error } = await supabase.from('flashcards').delete().eq('id', id);
    if (error) throw error;

    res.redirect(`/modules/${module_id}/edit`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error deleting question: ' + err.message);
  }
});

// POST /modules/:id/flashcards/add — Add a single new question to an existing module
app.post('/modules/:id/flashcards/add', async (req, res) => {
  const { id } = req.params;
  const { question, answer, question_type, options, rationale } = req.body;

  try {
    if (!question || !answer) {
      return res.status(400).send('Question and answer are required.');
    }

    const resolved = resolveQuestionTypeFields(question_type, options, answer);
    if (resolved.error) {
      return res.status(400).send(resolved.error);
    }

    const { error } = await supabase.from('flashcards').insert({
      module_id: id,
      question,
      answer,
      question_type: resolved.type,
      options: resolved.options,
      rationale: rationale || null
    });
    if (error) throw error;

    res.redirect(`/modules/${id}/edit`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error adding question: ' + err.message);
  }
});

// GET /api/flashcards/:moduleId — JSON endpoint used by quiz.js
app.get('/api/flashcards/:moduleId', async (req, res) => {
  try {
    const { data: flashcards, error } = await supabase
      .from('flashcards')
      .select('id, question, answer, question_type, options, rationale')
      .eq('module_id', req.params.moduleId)
      .order('id', { ascending: true });
    if (error) throw error;

    res.json(flashcards);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// POST /modules/:id/delete — Remove a module (and its flashcards via CASCADE)
app.post('/modules/:id/delete', async (req, res) => {
  try {
    const { error } = await supabase.from('modules').delete().eq('id', req.params.id);
    if (error) throw error;

    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error deleting module: ' + err.message);
  }
});

// ---------- Start server ----------
app.listen(PORT, () => {
  console.log(`YslaNotes running at http://localhost:${PORT}`);
});
