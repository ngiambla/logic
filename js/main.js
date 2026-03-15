import { CANVAS_W, CANVAS_H } from './constants.js';
import { buildCircuit, isSolved } from './circuit.js';
import { LEVELS } from './levels.js';
import { generateLevel } from './generator.js';
import { render } from './renderer.js';
import { initInput } from './input.js';
import { playToggle, playSolve, playGold, playClick } from './audio.js';
import { calcScore, loadProgress, saveProgress } from './scoring.js';
import { showScreen, showTutorial, showLevelComplete, populateLevelSelect } from './ui.js';

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
canvas.width = CANVAS_W;
canvas.height = CANVAS_H;

const state = {
  screen: 'menu',
  currentLevelId: 1,
  circuit: null,
  levelDesc: null,
  startTime: null,
  elapsedMs: 0,
  score: 0,
  progress: loadProgress(),
  animFrameId: null,
  solved: false,
};

let removeInput = null;

function getLevelDesc(id) {
  if (id <= 40) return LEVELS.find(l => l.id === id) || LEVELS[0];
  return generateLevel(id);
}

async function startLevel(levelId) {
  state.currentLevelId = levelId;
  state.levelDesc = getLevelDesc(levelId);
  state.circuit = buildCircuit(state.levelDesc);
  state.startTime = null;
  state.elapsedMs = 0;
  state.score = 0;
  state.solved = false;

  if (removeInput) removeInput();
  removeInput = initInput(canvas, () => state.circuit, (id) => {
    if (!state.solved) {
      playToggle();
      if (!state.startTime) state.startTime = performance.now();
    }
  });

  showScreen('screen-game');

  // Show tutorial if new gates
  if (state.levelDesc.newGates && state.levelDesc.newGates.length > 0) {
    if (state.animFrameId) cancelAnimationFrame(state.animFrameId);
    await showTutorial(state.levelDesc.newGates);
  }

  state.startTime = performance.now(); // Start timer after tutorial
  startGameLoop();
}

function startGameLoop() {
  if (state.animFrameId) cancelAnimationFrame(state.animFrameId);

  function gameLoop(ts) {
    if (state.screen !== 'game') return;

    if (state.startTime && !state.solved) {
      state.elapsedMs = ts - state.startTime;
    }

    if (!state.solved && isSolved(state.circuit)) {
      state.solved = true;
      if (!state.startTime) {
        // Edge case: already solved on load — give minimal time
        state.elapsedMs = 0;
      } else {
        state.elapsedMs = ts - state.startTime;
      }
      onLevelSolved();
    }

    const uiState = {
      elapsedMs: state.elapsedMs,
      levelName: state.levelDesc.name,
      score: state.score,
    };
    render(ctx, state.circuit, uiState);

    state.animFrameId = requestAnimationFrame(gameLoop);
  }

  state.screen = 'game';
  state.animFrameId = requestAnimationFrame(gameLoop);
}

function onLevelSolved() {
  const result = calcScore(state.elapsedMs, state.currentLevelId, state.levelDesc.targets);
  result.elapsedMs = state.elapsedMs;
  state.score = result.score;

  if (result.medal === 'GOLD') playGold();
  else playSolve();

  state.progress = saveProgress(state.progress, state.currentLevelId, result);

  setTimeout(() => {
    if (state.animFrameId) cancelAnimationFrame(state.animFrameId);
    showLevelComplete(state.levelDesc, result);
  }, 800);
}

// --- UI Event Handlers ---

document.getElementById('btn-play').addEventListener('click', () => {
  playClick();
  showScreen('screen-select');
  const extraLevels = Array.from({ length: 10 }, (_, i) => ({ id: 41 + i, name: `Level ${41 + i}` }));
  populateLevelSelect(
    [...LEVELS, ...extraLevels],
    state.progress,
    (id) => { playClick(); startLevel(id); }
  );
});

document.getElementById('btn-how').addEventListener('click', () => {
  playClick();
  showScreen('screen-how');
});

document.querySelectorAll('.btn-back').forEach(btn => {
  btn.addEventListener('click', () => {
    playClick();
    showScreen('screen-menu');
  });
});

document.getElementById('btn-next').addEventListener('click', () => {
  playClick();
  startLevel(state.currentLevelId + 1);
});

document.getElementById('btn-retry').addEventListener('click', () => {
  playClick();
  startLevel(state.currentLevelId);
});

document.getElementById('btn-menu-from-complete').addEventListener('click', () => {
  playClick();
  showScreen('screen-menu');
});

document.getElementById('btn-pause').addEventListener('click', () => {
  playClick();
  state.screen = 'menu';
  if (state.animFrameId) cancelAnimationFrame(state.animFrameId);
  showScreen('screen-menu');
});

document.getElementById('btn-hint').addEventListener('click', () => {
  if (state.levelDesc && state.levelDesc.hint) {
    alert(state.levelDesc.hint);
  }
});

// Initial canvas fill
ctx.fillStyle = '#0d0d0d';
ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
