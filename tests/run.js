/**
 * Logic game test suite — run with: node tests/run.js
 * Requires Node >= 18 (native ES modules).
 */

import { buildCircuit, simulate, isSolved, evalGate, segmentsOverlap, assignWireColors } from '../js/circuit.js';
import { GATE, NODE_TYPE, CANVAS_W, CANVAS_H } from '../js/constants.js';
import { LEVELS } from '../js/levels.js';
import { generateLevel } from '../js/generator.js';
import { autoLayoutVertical } from '../js/layout.js';
import { calcScore, loadProgress, isLevelUnlocked } from '../js/scoring.js';
import { isSatisfiable, findAllSolutions, countSolutions } from '../js/sat.js';
import { generateChallenge, submitSolution } from '../js/challenge.js';

let passed = 0;
let failed = 0;

function assert(cond, msg) {
  if (cond) {
    console.log(`  PASS  ${msg}`);
    passed++;
  } else {
    console.error(`  FAIL  ${msg}`);
    failed++;
  }
}

function section(title) {
  console.log(`\n=== ${title} ===`);
}

// ── Helper: brute-force check solvability ─────────────────────────────────────
function isSolvable(circuit) {
  const { inputIds, nodes } = circuit;
  const n = inputIds.length;
  const saved = inputIds.map(id => nodes[id].value);

  let found = false;
  for (let mask = 0; mask < (1 << n) && !found; mask++) {
    for (let i = 0; i < n; i++) {
      nodes[inputIds[i]].value = !!(mask & (1 << i));
    }
    simulate(circuit);
    if (isSolved(circuit)) found = true;
  }

  for (let i = 0; i < n; i++) nodes[inputIds[i]].value = saved[i];
  simulate(circuit);
  return found;
}

// ── 1. evalGate unit tests ────────────────────────────────────────────────────
section('evalGate');
assert(evalGate(GATE.AND, [true, true]) === true,   'AND(1,1)=1');
assert(evalGate(GATE.AND, [true, false]) === false,  'AND(1,0)=0');
assert(evalGate(GATE.AND, [false, false]) === false, 'AND(0,0)=0');
assert(evalGate(GATE.OR,  [false, false]) === false, 'OR(0,0)=0');
assert(evalGate(GATE.OR,  [true, false]) === true,   'OR(1,0)=1');
assert(evalGate(GATE.OR,  [true, true]) === true,    'OR(1,1)=1');
assert(evalGate(GATE.NOT, [false]) === true,         'NOT(0)=1');
assert(evalGate(GATE.NOT, [true]) === false,         'NOT(1)=0');
assert(evalGate(GATE.XOR, [true, false]) === true,   'XOR(1,0)=1');
assert(evalGate(GATE.XOR, [true, true]) === false,   'XOR(1,1)=0');
assert(evalGate(GATE.XOR, [false, false]) === false, 'XOR(0,0)=0');
assert(evalGate(GATE.NAND,[true, true]) === false,   'NAND(1,1)=0');
assert(evalGate(GATE.NAND,[true, false]) === true,   'NAND(1,0)=1');
assert(evalGate(GATE.NOR, [false, false]) === true,  'NOR(0,0)=1');
assert(evalGate(GATE.NOR, [true, false]) === false,  'NOR(1,0)=0');
assert(evalGate(GATE.XNOR,[true, true]) === true,    'XNOR(1,1)=1');
assert(evalGate(GATE.XNOR,[true, false]) === false,  'XNOR(1,0)=0');
assert(evalGate(GATE.XNOR,[false, false]) === true,  'XNOR(0,0)=1');

// ── 2. Single-gate circuit simulation ────────────────────────────────────────
section('Circuit simulation — AND gate');
{
  const desc = {
    inputs: [
      { id: 'A', label: 'A', initialValue: false },
      { id: 'B', label: 'B', initialValue: false },
    ],
    gates: [{ id: 'g0', type: GATE.AND }],
    outputs: [{ id: 'out0' }],
    connections: [['A','g0'],['B','g0'],['g0','out0']],
    targetPattern: [true],
  };
  autoLayoutVertical(desc, CANVAS_W, CANVAS_H);
  const c = buildCircuit(desc);
  assert(!isSolved(c), 'AND: initially unsolved');
  c.nodes['A'].value = true;
  c.nodes['B'].value = true;
  simulate(c);
  assert(isSolved(c), 'AND: solved with A=1, B=1');
  c.nodes['B'].value = false;
  simulate(c);
  assert(!isSolved(c), 'AND: unsolved with A=1, B=0');
}

section('Circuit simulation — OR gate');
{
  const desc = {
    inputs: [
      { id: 'A', label: 'A', initialValue: false },
      { id: 'B', label: 'B', initialValue: false },
    ],
    gates: [{ id: 'g0', type: GATE.OR }],
    outputs: [{ id: 'out0' }],
    connections: [['A','g0'],['B','g0'],['g0','out0']],
    targetPattern: [true],
  };
  autoLayoutVertical(desc, CANVAS_W, CANVAS_H);
  const c = buildCircuit(desc);
  assert(!isSolved(c), 'OR: initially unsolved');
  c.nodes['A'].value = true;
  simulate(c);
  assert(isSolved(c), 'OR: solved with A=1');
}

section('Circuit simulation — NOT gate');
{
  const desc = {
    inputs: [{ id: 'A', label: 'A', initialValue: true }],
    gates: [{ id: 'g0', type: GATE.NOT }],
    outputs: [{ id: 'out0' }],
    connections: [['A','g0'],['g0','out0']],
    targetPattern: [false],
  };
  autoLayoutVertical(desc, CANVAS_W, CANVAS_H);
  const c = buildCircuit(desc);
  c.nodes['A'].value = true;
  simulate(c);
  assert(isSolved(c), 'NOT: A=1 → output=0 = target false');
  c.nodes['A'].value = false;
  simulate(c);
  assert(!isSolved(c), 'NOT: A=0 → output=1 ≠ target false');
}

section('Circuit simulation — multiple outputs');
{
  const desc = {
    inputs: [
      { id: 'A', label: 'A', initialValue: false },
      { id: 'B', label: 'B', initialValue: false },
    ],
    gates: [
      { id: 'g0', type: GATE.AND },
      { id: 'g1', type: GATE.OR },
    ],
    outputs: [
      { id: 'out0' },
      { id: 'out1' },
    ],
    connections: [
      ['A','g0'],['B','g0'],['g0','out0'],
      ['A','g1'],['B','g1'],['g1','out1'],
    ],
    targetPattern: [true, true],
  };
  autoLayoutVertical(desc, CANVAS_W, CANVAS_H);
  const c = buildCircuit(desc);
  assert(!isSolved(c), 'Multi-out: initially unsolved');
  c.nodes['A'].value = true;
  c.nodes['B'].value = true;
  simulate(c);
  assert(isSolved(c), 'Multi-out: AND=1, OR=1 when A=B=1');
  c.nodes['A'].value = false;
  c.nodes['B'].value = true;
  simulate(c);
  assert(!isSolved(c), 'Multi-out: AND=0, OR=1 — pattern [F,T] ≠ [T,T]');
}

// ── 3. All 15 hand-crafted levels ────────────────────────────────────────────
section('Hand-crafted levels — starts unsolved');
for (const level of LEVELS) {
  const desc = JSON.parse(JSON.stringify(level));
  autoLayoutVertical(desc, CANVAS_W, CANVAS_H);
  const c = buildCircuit(desc);
  assert(!isSolved(c), `L${level.id} (${level.name}) starts unsolved`);
}

section('Hand-crafted levels — at least one solution exists');
for (const level of LEVELS) {
  const desc = JSON.parse(JSON.stringify(level));
  autoLayoutVertical(desc, CANVAS_W, CANVAS_H);
  const c = buildCircuit(desc);
  assert(isSolvable(c), `L${level.id} (${level.name}) is solvable`);
}

// ── 4. Generated levels (16–35) ───────────────────────────────────────────────
section('Generated levels 16–35 — solvable and start unsolved');
for (let lvl = 16; lvl <= 35; lvl++) {
  const desc = generateLevel(lvl);
  const c = buildCircuit(desc);
  const unsolvedAtStart = !isSolved(c);
  const solvable = isSolvable(c);
  assert(unsolvedAtStart, `Generated L${lvl} starts unsolved`);
  assert(solvable,        `Generated L${lvl} is solvable`);
}

// ── 5. Wire routing sanity ────────────────────────────────────────────────────
section('Wire routing — segments non-empty');
{
  const desc = JSON.parse(JSON.stringify(LEVELS[0]));
  autoLayoutVertical(desc, CANVAS_W, CANVAS_H);
  const c = buildCircuit(desc);
  let allHaveSegments = true;
  for (const wire of c.wires) {
    if (!wire.segments || wire.segments.length === 0) {
      allHaveSegments = false;
      break;
    }
  }
  assert(allHaveSegments, 'All wires in L1 have routing segments');
}

// ── 6. isSolved edge cases ───────────────────────────────────────────────────
section('isSolved edge cases');
{
  const desc = {
    inputs: [{ id: 'A', label: 'A', initialValue: false }],
    gates: [],
    outputs: [{ id: 'out0' }],
    connections: [['A','out0']],
    targetPattern: [false],
  };
  autoLayoutVertical(desc, CANVAS_W, CANVAS_H);
  const c = buildCircuit(desc);
  c.nodes['A'].value = false;
  simulate(c);
  assert(isSolved(c), 'Passthrough: A=0 → out0=0 = target false');
  c.nodes['A'].value = true;
  simulate(c);
  assert(!isSolved(c), 'Passthrough: A=1 → out0=1 ≠ target false');
}

// ── 7. No floating inputs ──────────────────────────────────────────────────
section('No floating inputs');
{
  // Circuit with a floating input — verify it's pruned
  const desc = {
    inputs: [
      { id: 'A', label: 'A', initialValue: false },
      { id: 'B', label: 'B', initialValue: false },
      { id: 'C', label: 'C', initialValue: false },  // floating — not connected
    ],
    gates: [{ id: 'g0', type: GATE.AND }],
    outputs: [{ id: 'out0' }],
    connections: [['A','g0'],['B','g0'],['g0','out0']],
    targetPattern: [true],
  };
  autoLayoutVertical(desc, CANVAS_W, CANVAS_H);
  const c = buildCircuit(desc);
  assert(!c.inputIds.includes('C'), 'Floating input C is pruned from circuit.inputIds');
  assert(!c.nodes['C'], 'Floating input C is pruned from circuit.nodes');
  assert(c.inputIds.length === 2, 'Only 2 connected inputs remain');
}

section('Hand-crafted levels — no floating inputs');
for (const level of LEVELS) {
  const desc = JSON.parse(JSON.stringify(level));
  autoLayoutVertical(desc, CANVAS_W, CANVAS_H);
  const c = buildCircuit(desc);
  const connectedSources = new Set(level.connections.map(([from]) => from));
  const allConnected = c.inputIds.every(id => connectedSources.has(id));
  assert(allConnected, `L${level.id}: every input is connected`);
}

section('Generated levels 16–35 — no floating inputs');
for (let lvl = 16; lvl <= 35; lvl++) {
  const desc = generateLevel(lvl);
  const c = buildCircuit(desc);
  const connectedSources = new Set(desc.connections.map(([from]) => from));
  const allConnected = c.inputIds.every(id => connectedSources.has(id));
  assert(allConnected, `Generated L${lvl}: no floating inputs`);
}

// ── 8. autoLayoutVertical ─────────────────────────────────────────────────────
section('autoLayoutVertical — valid coordinates');
{
  const desc = JSON.parse(JSON.stringify(LEVELS[0]));
  autoLayoutVertical(desc, 600, 900);
  const inputYs = desc.inputs.map(i => i.y);
  const gateYs = desc.gates.map(g => g.y);
  const outputDescs = desc.outputs ?? [];
  const outputYs = outputDescs.map(o => o.y);

  const maxInputY = Math.max(...inputYs);
  const minGateY = Math.min(...gateYs);
  const maxGateY = Math.max(...gateYs);
  const minOutputY = Math.min(...outputYs);

  assert(maxInputY < minGateY, 'Inputs y < Gates y');
  assert(maxGateY < minOutputY, 'Gates y < Outputs y');
  assert(desc.inputs.every(i => i.x >= 0 && i.x <= 600), 'Input x within bounds');
  assert(desc.inputs.every(i => i.y >= 0 && i.y <= 900), 'Input y within bounds');
}

section('All 15 levels solvable after auto-layout');
for (const level of LEVELS) {
  const desc = JSON.parse(JSON.stringify(level));
  autoLayoutVertical(desc, 600, 900);
  const c = buildCircuit(desc);
  assert(isSolvable(c), `L${level.id} solvable after auto-layout`);
}

// ── 9. Level progression ──────────────────────────────────────────────────────
section('Level progression — isLevelUnlocked');
{
  const progress = { levels: {}, totalScore: 0, unlockedUpTo: 1 };
  assert(isLevelUnlocked(progress, 1), 'Level 1 unlocked initially');
  assert(!isLevelUnlocked(progress, 2), 'Level 2 locked initially');
  assert(isLevelUnlocked(progress, 41), 'Level 41 always unlocked (procedural)');
  assert(isLevelUnlocked(progress, 100), 'Level 100 always unlocked (procedural)');

  progress.unlockedUpTo = 5;
  assert(isLevelUnlocked(progress, 5), 'Level 5 unlocked when unlockedUpTo=5');
  assert(!isLevelUnlocked(progress, 6), 'Level 6 locked when unlockedUpTo=5');

  // Migration from old save format
  const oldProgress = { levels: { 1: {}, 3: {}, 5: {} }, totalScore: 100 };
  // No unlockedUpTo — should be computed
  assert(oldProgress.unlockedUpTo === undefined, 'Old format lacks unlockedUpTo');
}

// ── 10. Wire overlap coloring ─────────────────────────────────────────────────
section('segmentsOverlap');
{
  // Two horizontal segments at same y, overlapping x range
  const s1 = { x1: 0, y1: 100, x2: 200, y2: 100 };
  const s2 = { x1: 150, y1: 100, x2: 350, y2: 100 };
  assert(segmentsOverlap(s1, s2), 'Overlapping horizontal segments detected');

  // Two horizontal segments at different y
  const s3 = { x1: 0, y1: 100, x2: 200, y2: 100 };
  const s4 = { x1: 0, y1: 200, x2: 200, y2: 200 };
  assert(!segmentsOverlap(s3, s4), 'Non-overlapping horizontal segments (different y)');

  // Two vertical segments at same x, overlapping y range
  const s5 = { x1: 100, y1: 0, x2: 100, y2: 200 };
  const s6 = { x1: 100, y1: 150, x2: 100, y2: 350 };
  assert(segmentsOverlap(s5, s6), 'Overlapping vertical segments detected');

  // Horizontal and vertical — no overlap
  const s7 = { x1: 0, y1: 100, x2: 200, y2: 100 };
  const s8 = { x1: 100, y1: 0, x2: 100, y2: 200 };
  assert(!segmentsOverlap(s7, s8), 'H vs V segments: no co-linear overlap');
}

section('Wire colors assigned');
{
  const desc = JSON.parse(JSON.stringify(LEVELS[0]));
  autoLayoutVertical(desc, 600, 900);
  const c = buildCircuit(desc);
  const allHaveColor = c.wires.every(w => typeof w.color === 'string' && w.color.startsWith('#'));
  assert(allHaveColor, 'All wires have assigned hex color');
}

// ── 11. SAT solver ───────────────────────────────────────────────────────────
section('SAT solver — gate encoding');
{
  // AND gate
  const andDesc = {
    inputs: [{ id: 'A', label: 'A' }, { id: 'B', label: 'B' }],
    gates: [{ id: 'g0', type: GATE.AND }],
    outputs: [{ id: 'out0' }],
    connections: [['A','g0'],['B','g0'],['g0','out0']],
  };
  autoLayoutVertical(andDesc, 600, 900);
  assert(isSatisfiable(andDesc, [true]), 'SAT: AND can produce true');
  assert(isSatisfiable(andDesc, [false]), 'SAT: AND can produce false');
  assert(countSolutions(andDesc, [true]) === 1, 'SAT: AND has 1 solution for true');
  assert(countSolutions(andDesc, [false]) === 3, 'SAT: AND has 3 solutions for false');

  // OR gate
  const orDesc = {
    inputs: [{ id: 'A', label: 'A' }, { id: 'B', label: 'B' }],
    gates: [{ id: 'g0', type: GATE.OR }],
    outputs: [{ id: 'out0' }],
    connections: [['A','g0'],['B','g0'],['g0','out0']],
  };
  autoLayoutVertical(orDesc, 600, 900);
  assert(countSolutions(orDesc, [true]) === 3, 'SAT: OR has 3 solutions for true');
  assert(countSolutions(orDesc, [false]) === 1, 'SAT: OR has 1 solution for false');

  // NOT gate
  const notDesc = {
    inputs: [{ id: 'A', label: 'A' }],
    gates: [{ id: 'g0', type: GATE.NOT }],
    outputs: [{ id: 'out0' }],
    connections: [['A','g0'],['g0','out0']],
  };
  autoLayoutVertical(notDesc, 600, 900);
  assert(countSolutions(notDesc, [true]) === 1, 'SAT: NOT has 1 solution for true (A=0)');
  assert(countSolutions(notDesc, [false]) === 1, 'SAT: NOT has 1 solution for false (A=1)');

  // XOR gate
  const xorDesc = {
    inputs: [{ id: 'A', label: 'A' }, { id: 'B', label: 'B' }],
    gates: [{ id: 'g0', type: GATE.XOR }],
    outputs: [{ id: 'out0' }],
    connections: [['A','g0'],['B','g0'],['g0','out0']],
  };
  autoLayoutVertical(xorDesc, 600, 900);
  assert(countSolutions(xorDesc, [true]) === 2, 'SAT: XOR has 2 solutions for true');
}

section('SAT findAllSolutions on known circuit');
{
  // AND(A,B) → out: only solution for true is A=1,B=1
  const desc = {
    inputs: [{ id: 'A', label: 'A' }, { id: 'B', label: 'B' }],
    gates: [{ id: 'g0', type: GATE.AND }],
    outputs: [{ id: 'out0' }],
    connections: [['A','g0'],['B','g0'],['g0','out0']],
  };
  autoLayoutVertical(desc, 600, 900);
  const solutions = findAllSolutions(desc, [true]);
  assert(solutions.length === 1, 'findAllSolutions: AND true has 1 solution');
  assert(solutions[0].inputValues[0] === true && solutions[0].inputValues[1] === true,
    'findAllSolutions: AND true solution is A=1,B=1');
}

// ── 12. Challenge mode ────────────────────────────────────────────────────────
section('Challenge mode — generateChallenge');
{
  const { levelDesc, allSolutions } = generateChallenge();
  assert(allSolutions.length >= 4, `Challenge has >= 4 solutions (got ${allSolutions.length})`);
  assert(allSolutions.length <= 16, `Challenge has <= 16 solutions (got ${allSolutions.length})`);
  assert(levelDesc.inputs.length >= 3, 'Challenge has >= 3 inputs');
  assert(levelDesc.outputs.length >= 2, 'Challenge has >= 2 outputs');
}

section('Challenge mode — submitSolution');
{
  const { levelDesc, allSolutions } = generateChallenge();
  autoLayoutVertical(levelDesc, 600, 900);
  const circuit = buildCircuit(levelDesc);

  const cs = {
    allSolutions,
    foundSolutions: [],
    startTime: Date.now(),
    timeLimit: 120000,
    finished: false,
  };

  // Submit a winning solution
  const winMask = allSolutions[0].mask;
  for (let i = 0; i < circuit.inputIds.length; i++) {
    circuit.nodes[circuit.inputIds[i]].value = !!(winMask & (1 << i));
  }
  simulate(circuit);

  const result1 = submitSolution(cs, circuit);
  assert(result1.isNew === true, 'First submission is new');
  assert(result1.isCorrect === true, 'First submission is correct');
  assert(result1.totalFound === 1, 'totalFound is 1 after first submission');

  // Submit same solution again
  const result2 = submitSolution(cs, circuit);
  assert(result2.isNew === false, 'Duplicate submission is not new');
  assert(result2.isCorrect === true, 'Duplicate submission is still correct');
  assert(result2.totalFound === 1, 'totalFound unchanged after duplicate');
}

section('Challenge mode — only after level 15');
{
  const progress1 = { levels: {}, totalScore: 0, unlockedUpTo: 1 };
  assert(progress1.unlockedUpTo <= 15, 'Challenge not accessible at unlockedUpTo=1');

  const progress2 = { levels: {}, totalScore: 0, unlockedUpTo: 16 };
  assert(progress2.unlockedUpTo > 15, 'Challenge accessible at unlockedUpTo=16');
}

// ── 13. Generated levels >2 outputs ──────────────────────────────────────────
section('Generated levels — multi-output support');
{
  // Level 26: progress=10, numOutputs = min(2+1, 10) = 3
  const desc26 = generateLevel(26);
  assert(desc26.outputs.length >= 3, `L26 has >= 3 outputs (got ${desc26.outputs.length})`);

  // Level 36: progress=20, numOutputs = min(2+2, 10) = 4
  const desc36 = generateLevel(36);
  assert(desc36.outputs.length >= 4, `L36 has >= 4 outputs (got ${desc36.outputs.length})`);
}

// ── Summary ───────────────────────────────────────────────────────────────────
console.log(`\n${'─'.repeat(40)}`);
console.log(`  ${passed} passed  |  ${failed} failed`);
console.log('─'.repeat(40));
if (failed > 0) process.exit(1);
