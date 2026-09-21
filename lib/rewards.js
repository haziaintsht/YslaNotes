// lib/rewards.js — coin-earning rules and balance math for the rewards store
// Score 100% -> 10 coins, 90-99% -> 9, 80-89% -> 8, ... 0-9% -> 0.
function coinsForScore(scorePct) {
  return Math.max(0, Math.min(10, Math.floor(scorePct / 10)));
}

// Coins earned from quizzes are capped per calendar day (redemptions aren't affected).
const DAILY_EARN_CAP = 30;

function computeBalance(transactions) {
  return transactions.reduce((sum, t) => {
    return t.kind === 'earned' ? sum + t.amount : sum - t.amount;
  }, 0);
}

module.exports = { coinsForScore, computeBalance, DAILY_EARN_CAP };
