// lib/stats.js — dashboard streak/score aggregation from quiz_attempts history

function toDateString(isoTimestamp) {
  return new Date(isoTimestamp).toISOString().slice(0, 10);
}

// Duolingo-style streak: counts consecutive days with an attempt, ending at
// today if today has one, or ending at yesterday if not (so the streak isn't
// zeroed out just because today isn't over yet).
function computeStreak(dateStrings) {
  const daySet = new Set(dateStrings);
  const oneDayMs = 24 * 60 * 60 * 1000;

  let cursor = new Date();
  cursor.setUTCHours(0, 0, 0, 0);
  if (!daySet.has(cursor.toISOString().slice(0, 10))) {
    cursor = new Date(cursor.getTime() - oneDayMs);
  }

  let streak = 0;
  while (daySet.has(cursor.toISOString().slice(0, 10))) {
    streak++;
    cursor = new Date(cursor.getTime() - oneDayMs);
  }
  return streak;
}

function computeDashboardStats(attempts, moduleCategoryMap) {
  const totalAttempts = attempts.length;

  if (totalAttempts === 0) {
    return { totalAttempts: 0, avgScore: null, weakestCategory: null, streak: 0 };
  }

  const avgScore = Math.round(attempts.reduce((sum, a) => sum + a.score_pct, 0) / totalAttempts);

  const categoryScores = {};
  attempts.forEach(a => {
    const category = moduleCategoryMap.get(a.module_id);
    if (!category) return;
    (categoryScores[category] = categoryScores[category] || []).push(a.score_pct);
  });

  let weakestCategory = null;
  let weakestAvg = Infinity;
  Object.entries(categoryScores).forEach(([category, scores]) => {
    const avg = scores.reduce((sum, s) => sum + s, 0) / scores.length;
    if (avg < weakestAvg) {
      weakestAvg = avg;
      weakestCategory = category;
    }
  });

  const streak = computeStreak(attempts.map(a => toDateString(a.created_at)));

  return { totalAttempts, avgScore, weakestCategory, streak };
}

module.exports = { computeDashboardStats, computeStreak };
