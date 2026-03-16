import { getCanvasSize } from './constants.js';
import { buildCircuit, computeWireRoutes, isSolved } from './circuit.js';
import { LEVELS } from './levels.js';
import { generateLevel } from './generator.js';
import { autoLayoutVertical } from './layout.js';
import { render } from './renderer.js';
import { initInput } from './input.js';
import { playToggle, playSolve, playGold, playClick } from './audio.js';
import { calcScore, loadProgress, saveProgress } from './scoring.js';
import { showScreen, showTutorial, showHint, showLevelComplete, populateLevelSelect } from './ui.js';
import { generateChallenge, calcChallengeScore } from './challenge.js';

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

function applyCanvasSize() {
  const { width, height } = getCanvasSize();
  canvas.width = width;
  canvas.height = height;
  return { width, height };
}

let canvasSize = applyCanvasSize();

const state = {
  screen: 'menu',
  mode: 'normal', // 'normal' | 'challenge'
  currentLevelId: 1,
  circuit: null,
  levelDesc: null,
  startTime: null,
  elapsedMs: 0,
  score: 0,
  progress: loadProgress(),
  animFrameId: null,
  solved: false,
  challengeState: null,
};

let removeInput = null;

function getLevelDesc(id) {
  if (id <= 15) {
    const desc = LEVELS.find(l => l.id === id) || LEVELS[0];
    // Deep clone to avoid mutating the original
    return JSON.parse(JSON.stringify(desc));
  }
  return generateLevel(id);
}

function layoutAndBuild(levelDesc) {
  autoLayoutVertical(levelDesc, canvasSize.width, canvasSize.height);
  return buildCircuit(levelDesc);
}

async function startLevel(levelId) {
  state.currentLevelId = levelId;
  state.mode = 'normal';
  state.challengeState = null;
  state.levelDesc = getLevelDesc(levelId);
  canvasSize = applyCanvasSize();
  state.circuit = layoutAndBuild(state.levelDesc);
  state.startTime = null;
  state.elapsedMs = 0;
  state.score = 0;
  state.solved = false;
  document.getElementById('btn-submit').style.display = 'none';

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

    if (state.mode === 'normal' && !state.solved && isSolved(state.circuit)) {
      state.solved = true;
      if (!state.startTime) {
        state.elapsedMs = 0;
      } else {
        state.elapsedMs = ts - state.startTime;
      }
      onLevelSolved();
    }

    // Challenge mode timer
    if (state.mode === 'challenge' && state.challengeState) {
      const cs = state.challengeState;
      if (!cs.finished) {
        const elapsed = ts - cs.startTime;
        if (elapsed >= cs.timeLimit) {
          cs.finished = true;
          onChallengeComplete();
        }
      }
    }

    const uiState = {
      elapsedMs: state.elapsedMs,
      levelName: state.levelDesc.name,
      score: state.score,
    };

    if (state.mode === 'challenge' && state.challengeState) {
      const cs = state.challengeState;
      uiState.challengeMode = true;
      uiState.foundCount = cs.foundSolutions.length;
      uiState.timeRemaining = Math.max(0, cs.timeLimit - (ts - cs.startTime));
    }

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

// --- Dynamic Resize ---
function handleResize() {
  if (state.screen !== 'game' || !state.levelDesc || !state.circuit) return;
  canvasSize = applyCanvasSize();
  autoLayoutVertical(state.levelDesc, canvasSize.width, canvasSize.height);
  // Re-apply layout positions to circuit nodes
  for (const inp of state.levelDesc.inputs) {
    if (state.circuit.nodes[inp.id]) {
      state.circuit.nodes[inp.id].x = inp.x;
      state.circuit.nodes[inp.id].y = inp.y;
    }
  }
  for (const gate of state.levelDesc.gates) {
    if (state.circuit.nodes[gate.id]) {
      state.circuit.nodes[gate.id].x = gate.x;
      state.circuit.nodes[gate.id].y = gate.y;
    }
  }
  const outputs = state.levelDesc.outputs ?? [];
  for (const out of outputs) {
    if (state.circuit.nodes[out.id]) {
      state.circuit.nodes[out.id].x = out.x;
      state.circuit.nodes[out.id].y = out.y;
    }
  }
  computeWireRoutes(state.circuit);
}

window.addEventListener('resize', handleResize);
// Also listen to visualViewport resize (mobile browser chrome changes)
if (window.visualViewport) {
  window.visualViewport.addEventListener('resize', handleResize);
}

// --- UI Event Handlers ---

document.getElementById('btn-play').addEventListener('click', () => {
  playClick();
  showScreen('screen-select');
  const extraLevels = Array.from({ length: 10 }, (_, i) => ({ id: 16 + i, name: `Level ${16 + i}` }));
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

document.getElementById('btn-hint').addEventListener('click', async () => {
  if (state.levelDesc && state.levelDesc.hint) {
    const pausedAt = performance.now();
    await showHint(state.levelDesc.hint);
    // Compensate timer for time spent in hint overlay
    if (state.startTime && !state.solved) {
      state.startTime += (performance.now() - pausedAt);
    }
  }
});

// --- Challenge Mode ---

const btnSubmit = document.getElementById('btn-submit');

function doStartChallengeMode() {
  const challengeData = generateChallenge();
  const { levelDesc, allSolutions } = challengeData;
  state.mode = 'challenge';
  state.currentLevelId = 0;
  state.levelDesc = levelDesc;
  canvasSize = applyCanvasSize();
  state.circuit = layoutAndBuild(levelDesc);
  state.solved = false;

  state.challengeState = {
    allSolutions,
    foundSolutions: [],
    startTime: performance.now(),
    timeLimit: 120000,
    finished: false,
  };

  if (removeInput) removeInput();
  removeInput = initInput(canvas, () => state.circuit, () => {
    playToggle();
  });

  btnSubmit.style.display = '';
  showScreen('screen-game');
  startGameLoop();
}

function doSubmitChallenge() {
  if (!state.challengeState || state.challengeState.finished) return;
  const cs = state.challengeState;
  const circuit = state.circuit;

  const inputMask = circuit.inputIds.reduce((mask, id, i) => {
    return mask | (circuit.nodes[id].value ? (1 << i) : 0);
  }, 0);

  const isCorrect = cs.allSolutions.some(s => s.mask === inputMask);
  const isNew = isCorrect && !cs.foundSolutions.some(s => s.mask === inputMask);

  if (isNew) {
    cs.foundSolutions.push({ mask: inputMask });
    playSolve();
    if (cs.foundSolutions.length === cs.allSolutions.length) {
      cs.finished = true;
      onChallengeComplete();
    }
  } else if (!isCorrect) {
    playClick();
  }
}

function showChallengeCompleteScreen(cs) {
  const score = calcChallengeScore(cs);
  const allFound = cs.foundSolutions.length === cs.allSolutions.length;
  document.getElementById('challenge-title').textContent =
    allFound ? '// CIRCUIT SOLVED' : '// TIME\'S UP';
  document.getElementById('challenge-message').textContent =
    allFound
      ? 'You found all solutions to today\'s circuit!'
      : `You found ${cs.foundSolutions.length} solution${cs.foundSolutions.length !== 1 ? 's' : ''}.`;
  document.getElementById('challenge-score').textContent = score + ' pts';
  btnSubmit.style.display = 'none';
  showScreen('screen-challenge-complete');
}

btnSubmit.addEventListener('click', () => {
  doSubmitChallenge();
});

document.getElementById('btn-challenge-retry').addEventListener('click', () => {
  playClick();
  doStartChallengeMode();
});

document.getElementById('btn-challenge-menu').addEventListener('click', () => {
  playClick();
  btnSubmit.style.display = 'none';
  showScreen('screen-menu');
});

// Override onChallengeComplete to use the screen
function onChallengeComplete() {
  const cs = state.challengeState;
  setTimeout(() => {
    if (state.animFrameId) cancelAnimationFrame(state.animFrameId);
    showChallengeCompleteScreen(cs);
  }, 500);
}

// Make challenge entry available to UI
window._startChallenge = doStartChallengeMode;

// Initial canvas fill
ctx.fillStyle = '#0d0d0d';
ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);
