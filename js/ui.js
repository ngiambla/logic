import { GATE, GATE_LABEL } from './constants.js';
import { isLevelUnlocked } from './scoring.js';

const GATE_DESCRIPTIONS = {
  [GATE.AND]:  { name: 'AND',  symbol: 'AND',  truth: [[0,0,0],[0,1,0],[1,0,0],[1,1,1]], desc: 'Output is 1 only when ALL inputs are 1.' },
  [GATE.OR]:   { name: 'OR',   symbol: 'OR',   truth: [[0,0,0],[0,1,1],[1,0,1],[1,1,1]], desc: 'Output is 1 when ANY input is 1.' },
  [GATE.NOT]:  { name: 'NOT',  symbol: 'NOT',  truth: [[0,1],[1,0]], desc: 'Output is the inverse of the input.' },
  [GATE.XOR]:  { name: 'XOR',  symbol: 'XOR',  truth: [[0,0,0],[0,1,1],[1,0,1],[1,1,0]], desc: 'Output is 1 when inputs are DIFFERENT.' },
  [GATE.NAND]: { name: 'NAND', symbol: 'NAND', truth: [[0,0,1],[0,1,1],[1,0,1],[1,1,0]], desc: 'Output is 0 only when ALL inputs are 1.' },
  [GATE.NOR]:  { name: 'NOR',  symbol: 'NOR',  truth: [[0,0,1],[0,1,0],[1,0,0],[1,1,0]], desc: 'Output is 1 only when ALL inputs are 0.' },
  [GATE.XNOR]: { name: 'XNOR', symbol: 'XNOR', truth: [[0,0,1],[0,1,0],[1,0,0],[1,1,1]], desc: 'Output is 1 when inputs are the SAME.' },
};

export function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const target = document.getElementById(screenId);
  if (target) target.classList.add('active');
}

export function updateHUD(elapsedMs, levelName, score) {
  // HUD is drawn on canvas — this is for any DOM HUD elements if needed
}

export function showTutorial(newGates) {
  if (!newGates || newGates.length === 0) return Promise.resolve();

  const overlay = document.getElementById('screen-tutorial');
  const content = document.getElementById('tutorial-content');

  let html = '<h2 class="crt-title">// NEW GATE UNLOCKED</h2>';
  for (const gateType of newGates) {
    const info = GATE_DESCRIPTIONS[gateType];
    if (!info) continue;
    html += `
      <div class="gate-info">
        <div class="gate-symbol">${info.symbol}</div>
        <div class="gate-name">${info.name} GATE</div>
        <p>${info.desc}</p>
        <table class="truth-table">
          <tr>${info.truth[0].length === 3 ? '<th>A</th><th>B</th>' : '<th>IN</th>'}<th>OUT</th></tr>
          ${info.truth.map(row =>
            `<tr>${row.map((v, i) => i < row.length - 1
              ? `<td class="${v ? 'val-1' : 'val-0'}">${v}</td>`
              : `<td class="out ${v ? 'val-1' : 'val-0'}">${v}</td>`
            ).join('')}</tr>`
          ).join('')}
        </table>
      </div>
    `;
  }
  html += '<button id="tutorial-ok" class="crt-btn">[ CONTINUE ]</button>';

  content.innerHTML = html;
  overlay.classList.add('active');

  return new Promise(resolve => {
    document.getElementById('tutorial-ok').addEventListener('click', () => {
      overlay.classList.remove('active');
      resolve();
    });
  });
}

export function showHint(hintText) {
  const overlay = document.getElementById('screen-hint');
  const content = document.getElementById('hint-content');

  content.innerHTML = `
    <h2 class="crt-title">// HINT</h2>
    <p style="color: #aaa; line-height: 1.8; margin-bottom: 24px;">${hintText}</p>
    <button id="hint-dismiss" class="crt-btn">[ DISMISS ]</button>
  `;
  overlay.classList.add('active');

  return new Promise(resolve => {
    document.getElementById('hint-dismiss').addEventListener('click', () => {
      overlay.classList.remove('active');
      resolve();
    });
  });
}

export function showLevelComplete(levelData, result) {
  const screen = document.getElementById('screen-complete');
  document.getElementById('complete-level').textContent = levelData.name;
  document.getElementById('complete-medal').textContent = getMedalEmoji(result.medal) + ' ' + result.medal;
  document.getElementById('complete-medal').className = 'medal-display medal-' + result.medal.toLowerCase();
  document.getElementById('complete-score').textContent = result.score + ' pts';
  document.getElementById('complete-time').textContent = (result.elapsedMs / 1000).toFixed(2) + 's';
  showScreen('screen-complete');
}

function getMedalEmoji(medal) {
  switch (medal) {
    case 'GOLD':   return '[G]';
    case 'SILVER': return '[S]';
    case 'BRONZE': return '[B]';
    default:       return '[+]';
  }
}

export function populateLevelSelect(levels, progress, onSelect) {
  const grid = document.getElementById('level-grid');
  grid.innerHTML = '';
  for (const level of levels) {
    const btn = document.createElement('button');
    btn.className = 'level-btn crt-btn';
    const locked = !isLevelUnlocked(progress, level.id);
    const saved = progress.levels[level.id];
    const medal = saved ? saved.medal : '';

    if (locked) {
      btn.classList.add('locked');
      btn.disabled = true;
      btn.innerHTML = `<span class="lvl-num">${level.id}</span><span class="lvl-medal">[X]</span>`;
      btn.title = `Level ${level.id} — Locked`;
    } else {
      const medalTag = medal ? `<span class="lvl-medal">${getMedalEmoji(medal)}</span>` : '';
      btn.innerHTML = `<span class="lvl-num">${level.id}</span>${medalTag}`;
      btn.title = level.name || `Level ${level.id}`;
      if (medal === 'GOLD') btn.classList.add('gold');
      else if (medal === 'SILVER') btn.classList.add('silver');
      else if (medal === 'BRONZE') btn.classList.add('bronze');
      btn.addEventListener('click', () => onSelect(level.id));
    }
    grid.appendChild(btn);
  }

  // Always show challenge mode button at the end of the grid
  const challengeBtn = document.createElement('button');
  challengeBtn.className = 'crt-btn crt-btn-primary challenge-btn';
  challengeBtn.textContent = '[ CHALLENGE MODE ]';
  challengeBtn.style.marginTop = '16px';
  challengeBtn.style.gridColumn = '1 / -1';
  challengeBtn.addEventListener('click', () => {
    if (typeof window._startChallenge === 'function') {
      window._startChallenge();
    }
  });
  grid.appendChild(challengeBtn);
}
