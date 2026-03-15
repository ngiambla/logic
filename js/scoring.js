const STORAGE_KEY = 'logic_progress';

export function calcScore(elapsedMs, levelNum, targets) {
  const elapsed = elapsedMs / 1000;
  const { gold, silver, bronze } = targets;

  let base, bonus;
  if (elapsed <= gold) {
    base = 1000;
    bonus = Math.floor(((gold - elapsed) / gold) * 500);
  } else if (elapsed <= silver) {
    base = 700;
    bonus = 0;
  } else if (elapsed <= bronze) {
    base = 400;
    bonus = 0;
  } else {
    base = 100;
    bonus = 0;
  }

  const multiplier = 1 + (levelNum - 1) * 0.05;
  const score = Math.floor((base + bonus) * multiplier);

  let medal;
  if (elapsed <= gold) medal = 'GOLD';
  else if (elapsed <= silver) medal = 'SILVER';
  else if (elapsed <= bronze) medal = 'BRONZE';
  else medal = 'NONE';

  return { score, medal, base, bonus, multiplier };
}

export function loadProgress() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : { levels: {}, totalScore: 0 };
  } catch {
    return { levels: {}, totalScore: 0 };
  }
}

export function saveProgress(progress, levelId, result) {
  const existing = progress.levels[levelId];
  if (!existing || result.score > existing.score) {
    progress.levels[levelId] = result;
  }
  progress.totalScore = Object.values(progress.levels).reduce((s, l) => s + l.score, 0);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // Storage not available
  }
  return progress;
}
