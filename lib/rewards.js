// lib/rewards.js — coin-earning rules and balance math for the rewards store
// Score 100% -> 10 coins, 90-99% -> 9, 80-89% -> 8, ... 0-9% -> 0.
function coinsForScore(scorePct) {
  return Math.max(0, Math.min(10, Math.floor(scorePct / 10)));
}

function computeBalance(transactions) {
  return transactions.reduce((sum, t) => {
    return t.kind === 'earned' ? sum + t.amount : sum - t.amount;
  }, 0);
}

module.exports = { coinsForScore, computeBalance };
