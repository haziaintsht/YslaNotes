// quiz.js — Frontend flashcard flip + review logic
// Expects a global `flashcards` array (injected inline in study.ejs)
// and a global `moduleId` variable.

document.addEventListener('DOMContentLoaded', () => {
  if (typeof flashcards === 'undefined' || flashcards.length === 0) {
    return;
  }

  const CHECK_SVG = '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.5"/><path d="M8.5 12.5l2.3 2.3 4.7-5"/></svg>';
  const X_SVG = '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.5"/><path d="M9.5 9.5l5 5M14.5 9.5l-5 5"/></svg>';

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function playSound(name) {
    if (window.SoundManager) window.SoundManager[name]();
  }

  let activeDeck = flashcards.slice();
  let isFullDeck = true;
  let currentIndex = 0;
  let score = { gotIt: 0, needsReview: 0 };
  const reviewedIds = new Set();
  let missedIds = new Set();
  let examTimerInterval = null;

  const card = document.getElementById('flashcard');
  const cardFront = document.getElementById('card-front-text');
  const cardBack = document.getElementById('card-back-text');
  const cardBackRationale = document.getElementById('card-back-rationale');
  const flashcardContainer = document.getElementById('flashcard-container');
  const mcContainer = document.getElementById('mc-container');
  const mcQuestion = document.getElementById('mc-question');
  const mcOptions = document.getElementById('mc-options');
  const mcFeedback = document.getElementById('mc-feedback');
  const mcRationale = document.getElementById('mc-rationale');
  const selfAssess = document.getElementById('self-assess');
  const counter = document.getElementById('card-counter');
  const progressFill = document.getElementById('progress-fill');
  const gotItCount = document.getElementById('got-it-count');
  const reviewCount = document.getElementById('review-count');
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  const gotItBtn = document.getElementById('got-it-btn');
  const reviewBtn = document.getElementById('review-btn');
  const restartBtn = document.getElementById('restart-btn');
  const quizSession = document.getElementById('quiz-session');
  const completionScreen = document.getElementById('completion-screen');
  const finalCorrect = document.getElementById('final-correct');
  const finalReview = document.getElementById('final-review');
  const finalScorePct = document.getElementById('final-score-pct');
  const restartFromCompleteBtn = document.getElementById('restart-from-complete-btn');
  const reviewMissedBtn = document.getElementById('review-missed-btn');
  const missedCountEl = document.getElementById('missed-count');
  const attemptsList = document.getElementById('attempts-list');
  const examModeToggle = document.getElementById('exam-mode-toggle');
  const examModeControls = document.getElementById('exam-mode-controls');
  const examDuration = document.getElementById('exam-duration');
  const examStartBtn = document.getElementById('exam-start-btn');
  const examTimerEl = document.getElementById('exam-timer');

  function renderCard() {
    const current = activeDeck[currentIndex];
    counter.textContent = `Card ${currentIndex + 1} of ${activeDeck.length}`;
    const progressPct = ((currentIndex + 1) / activeDeck.length) * 100;
    progressFill.style.width = `${progressPct}%`;
    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex === activeDeck.length - 1;

    if (Array.isArray(current.options) && current.options.length > 0) {
      flashcardContainer.classList.add('hidden');
      selfAssess.classList.add('hidden');
      mcContainer.classList.remove('hidden');
      renderMultipleChoice(current);
    } else {
      mcContainer.classList.add('hidden');
      flashcardContainer.classList.remove('hidden');
      selfAssess.classList.remove('hidden');
      cardFront.textContent = current.question;
      cardBack.textContent = current.answer;
      if (current.rationale) {
        cardBackRationale.textContent = current.rationale;
        cardBackRationale.classList.remove('hidden');
      } else {
        cardBackRationale.classList.add('hidden');
      }
      card.classList.remove('flipped');
    }
    updateScoreDisplay();
  }

  function renderMultipleChoice(current) {
    mcQuestion.textContent = current.question;
    mcFeedback.classList.add('hidden');
    mcRationale.classList.add('hidden');
    mcOptions.innerHTML = '';
    mcOptions.dataset.answered = 'false';

    const shuffled = [...current.options].sort(() => Math.random() - 0.5);
    shuffled.forEach(option => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'mc-option text-left border border-slate-300 rounded-lg px-4 py-3 hover:bg-slate-50 transition disabled:opacity-60';
      btn.textContent = option;
      btn.addEventListener('click', () => selectOption(current, option, btn));
      mcOptions.appendChild(btn);
    });
  }

  function selectOption(current, chosen, btn) {
    if (mcOptions.dataset.answered === 'true') return;
    mcOptions.dataset.answered = 'true';

    const correct = chosen === current.answer;
    if (!reviewedIds.has(current.id)) {
      reviewedIds.add(current.id);
      if (correct) {
        score.gotIt++;
        missedIds.delete(current.id);
      } else {
        score.needsReview++;
        missedIds.add(current.id);
      }
      updateScoreDisplay();
    }

    Array.from(mcOptions.children).forEach(child => {
      child.disabled = true;
      if (child.textContent === current.answer) child.classList.add('mc-correct');
      else if (child === btn) child.classList.add('mc-incorrect');
    });

    mcFeedback.innerHTML = correct
      ? `<span class="inline-flex items-center gap-1">${CHECK_SVG} Correct!</span>`
      : `<span class="inline-flex items-center gap-1">${X_SVG} Incorrect — correct answer: ${escapeHtml(current.answer)}</span>`;
    mcFeedback.className = `mt-4 font-semibold ${correct ? 'text-emerald-600' : 'text-pink-600'}`;
    mcFeedback.classList.remove('hidden');
    if (current.rationale) {
      mcRationale.textContent = current.rationale;
      mcRationale.classList.remove('hidden');
    }
    playSound(correct ? 'correct' : 'incorrect');

    if (reviewedIds.size === activeDeck.length) {
      // brief delay so the correct/incorrect feedback is visible before the summary appears
      setTimeout(showCompletion, 1200);
    }
  }

  function updateScoreDisplay() {
    gotItCount.textContent = score.gotIt;
    reviewCount.textContent = score.needsReview;
  }

  function flipCard() {
    card.classList.toggle('flipped');
    playSound('flip');
  }

  function goNext() {
    if (currentIndex < activeDeck.length - 1) {
      currentIndex++;
      renderCard();
    }
  }

  function goPrev() {
    if (currentIndex > 0) {
      currentIndex--;
      renderCard();
    }
  }

  function markCard(status) {
    playSound(status === 'gotIt' ? 'correct' : 'incorrect');
    const id = activeDeck[currentIndex].id;
    if (!reviewedIds.has(id)) {
      reviewedIds.add(id);
      if (status === 'gotIt') {
        score.gotIt++;
        missedIds.delete(id);
      } else {
        score.needsReview++;
        missedIds.add(id);
      }
      updateScoreDisplay();
    }
    if (reviewedIds.size === activeDeck.length) {
      showCompletion();
    } else {
      goNext();
    }
  }

  function stopExamTimer() {
    if (examTimerInterval) {
      clearInterval(examTimerInterval);
      examTimerInterval = null;
    }
    examTimerEl.classList.add('hidden');
    examModeControls.classList.add('hidden');
    examModeControls.classList.remove('flex');
    examModeToggle.checked = false;
    examModeToggle.disabled = false;
  }

  function showCompletion() {
    stopExamTimer();
    quizSession.classList.add('hidden');
    completionScreen.classList.remove('hidden');
    playSound('complete');
    if (window.fireConfetti) window.fireConfetti();
    finalCorrect.textContent = score.gotIt;
    finalReview.textContent = score.needsReview;
    finalScorePct.textContent = `${Math.round((score.gotIt / activeDeck.length) * 100)}%`;

    if (missedIds.size > 0) {
      missedCountEl.textContent = missedIds.size;
      reviewMissedBtn.classList.remove('hidden');
    } else {
      reviewMissedBtn.classList.add('hidden');
    }

    if (isFullDeck) {
      saveAttempt(score.gotIt, score.needsReview, activeDeck.length);
    }
  }

  function saveAttempt(correct, review, total) {
    fetch(`/modules/${moduleId}/attempts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ correct, review, total })
    })
      .then(res => {
        if (!res.ok) throw new Error('attempt save failed');
        return res.json();
      })
      .then(() => {
        const noAttemptsMsg = document.getElementById('no-attempts-msg');
        if (noAttemptsMsg) noAttemptsMsg.remove();
        const li = document.createElement('li');
        const pct = Math.round((correct / total) * 100);
        li.textContent = `Just now — ${correct}/${total} (${pct}%)`;
        attemptsList.insertBefore(li, attemptsList.firstChild);
      })
      .catch(() => {}); // non-critical — losing one history row silently is fine
  }

  function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function startSession(deck, fullDeck) {
    activeDeck = deck;
    isFullDeck = fullDeck;
    currentIndex = 0;
    score = { gotIt: 0, needsReview: 0 };
    reviewedIds.clear();
    missedIds = new Set();
    stopExamTimer();
    completionScreen.classList.add('hidden');
    quizSession.classList.remove('hidden');
    renderCard();
  }

  function restart() {
    startSession(shuffleArray(flashcards.slice()), true);
  }

  function reviewMissed() {
    const missedSnapshot = new Set(missedIds);
    const deck = flashcards.filter(f => missedSnapshot.has(f.id));
    if (deck.length === 0) return;
    startSession(shuffleArray(deck), false);
  }

  function startExamTimer() {
    const minutes = Number(examDuration.value) || 15;
    let secondsRemaining = minutes * 60;

    examModeControls.classList.add('hidden');
    examModeControls.classList.remove('flex');
    examModeToggle.disabled = true;
    examTimerEl.classList.remove('hidden');

    function renderTime() {
      const m = Math.floor(secondsRemaining / 60);
      const s = secondsRemaining % 60;
      examTimerEl.textContent = `${m}:${String(s).padStart(2, '0')}`;
    }

    renderTime();
    examTimerInterval = setInterval(() => {
      secondsRemaining--;
      renderTime();
      if (secondsRemaining <= 0) {
        clearInterval(examTimerInterval);
        examTimerInterval = null;
        // time's up — whatever wasn't answered counts as "needs review"
        activeDeck.forEach(c => {
          if (!reviewedIds.has(c.id)) {
            reviewedIds.add(c.id);
            score.needsReview++;
            missedIds.add(c.id);
          }
        });
        updateScoreDisplay();
        showCompletion();
      }
    }, 1000);
  }

  card.addEventListener('click', flipCard);
  nextBtn.addEventListener('click', goNext);
  prevBtn.addEventListener('click', goPrev);
  gotItBtn.addEventListener('click', () => markCard('gotIt'));
  reviewBtn.addEventListener('click', () => markCard('needsReview'));
  restartBtn.addEventListener('click', restart);
  restartFromCompleteBtn.addEventListener('click', restart);
  reviewMissedBtn.addEventListener('click', reviewMissed);

  examModeToggle.addEventListener('change', () => {
    if (examModeToggle.checked) {
      examModeControls.classList.remove('hidden');
      examModeControls.classList.add('flex');
    } else {
      examModeControls.classList.add('hidden');
      examModeControls.classList.remove('flex');
    }
  });
  examStartBtn.addEventListener('click', startExamTimer);

  // Keyboard shortcuts: space/enter = flip, arrows = navigate
  document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.code === 'Enter') {
      e.preventDefault();
      flipCard();
    } else if (e.code === 'ArrowRight') {
      goNext();
    } else if (e.code === 'ArrowLeft') {
      goPrev();
    }
  });

  renderCard();
});

// --- Dynamic add/remove Q&A rows on the create-module form ---
function addFlashcardRow() {
  const container = document.getElementById('qa-rows');
  const row = document.createElement('div');
  row.className = 'qa-row flex flex-col gap-2 mb-3';
  row.innerHTML = `
    <div class="flex justify-between items-center">
      <span class="text-sm font-semibold text-slate-500">Flashcard</span>
      <button type="button" onclick="this.closest('.qa-row').remove()" class="text-red-500 text-sm hover:underline">Remove</button>
    </div>
    <input type="text" name="questions[]" placeholder="Question" required
      class="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400" />
    <textarea name="answers[]" placeholder="Answer" required rows="2"
      class="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400"></textarea>
  `;
  container.appendChild(row);
}
