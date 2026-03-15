/**
 * Logic game test suite — run with: node tests/run.js
 * Requires Node >= 18 (native ES modules).
 */

import { buildCircuit, simulate, isSolved, evalGate } from '../js/circuit.js';
import { GATE, NODE_TYPE } from '../js/constants.js';
import { LEVELS } from '../js/levels.js';
import { generateLevel } from '../js/generator.js';

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
  // Save current state
  const saved = inputIds.map(id => nodes[id].value);

  let found = false;
  for (let mask = 0; mask < (1 << n) && !found; mask++) {
    for (let i = 0; i < n; i++) {
      nodes[inputIds[i]].value = !!(mask & (1 << i));
    }
    simulate(circuit);
    if (isSolved(circuit)) found = true;
  }

  // Restore
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
      { id: 'A', label: 'A', x: 100, y: 200, initialValue: false },
      { id: 'B', label: 'B', x: 100, y: 300, initialValue: false },
    ],
    gates: [{ id: 'g0', type: GATE.AND, x: 300, y: 250 }],
    outputs: [{ id: 'out0', x: 500, y: 250 }],
    connections: [['A','g0'],['B','g0'],['g0','out0']],
    targetPattern: [true],
  };
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
      { id: 'A', label: 'A', x: 100, y: 200, initialValue: false },
      { id: 'B', label: 'B', x: 100, y: 300, initialValue: false },
    ],
    gates: [{ id: 'g0', type: GATE.OR, x: 300, y: 250 }],
    outputs: [{ id: 'out0', x: 500, y: 250 }],
    connections: [['A','g0'],['B','g0'],['g0','out0']],
    targetPattern: [true],
  };
  const c = buildCircuit(desc);
  assert(!isSolved(c), 'OR: initially unsolved');
  c.nodes['A'].value = true;
  simulate(c);
  assert(isSolved(c), 'OR: solved with A=1');
}

section('Circuit simulation — NOT gate');
{
  const desc = {
    inputs: [{ id: 'A', label: 'A', x: 100, y: 250, initialValue: true }],
    gates: [{ id: 'g0', type: GATE.NOT, x: 300, y: 250 }],
    outputs: [{ id: 'out0', x: 500, y: 250 }],
    connections: [['A','g0'],['g0','out0']],
    targetPattern: [false],
  };
  const c = buildCircuit(desc);
  // buildCircuit auto-adjusts to non-winning state, so manually verify gate logic:
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
      { id: 'A', label: 'A', x: 100, y: 200, initialValue: false },
      { id: 'B', label: 'B', x: 100, y: 300, initialValue: false },
    ],
    gates: [
      { id: 'g0', type: GATE.AND, x: 300, y: 200 },
      { id: 'g1', type: GATE.OR,  x: 300, y: 300 },
    ],
    outputs: [
      { id: 'out0', x: 500, y: 200 },
      { id: 'out1', x: 500, y: 300 },
    ],
    connections: [
      ['A','g0'],['B','g0'],['g0','out0'],
      ['A','g1'],['B','g1'],['g1','out1'],
    ],
    targetPattern: [true, true],
  };
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

// ── 3. All 40 hand-crafted levels ────────────────────────────────────────────
section('Hand-crafted levels — starts unsolved');
for (const level of LEVELS) {
  const c = buildCircuit(level);
  assert(!isSolved(c), `L${level.id} (${level.name}) starts unsolved`);
}

section('Hand-crafted levels — at least one solution exists');
for (const level of LEVELS) {
  const c = buildCircuit(level);
  assert(isSolvable(c), `L${level.id} (${level.name}) is solvable`);
}

// ── 4. Generated levels (41–60) ───────────────────────────────────────────────
section('Generated levels 41–60 — solvable and start unsolved');
for (let lvl = 41; lvl <= 60; lvl++) {
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
  const c = buildCircuit(LEVELS[0]);
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
    inputs: [{ id: 'A', label: 'A', x: 100, y: 200, initialValue: false }],
    gates: [],
    outputs: [{ id: 'out0', x: 300, y: 200 }],
    connections: [['A','out0']],
    targetPattern: [false],
  };
  const c = buildCircuit(desc);
  // Manually verify isSolved logic regardless of initial state
  c.nodes['A'].value = false;
  simulate(c);
  assert(isSolved(c), 'Passthrough: A=0 → out0=0 = target false');
  c.nodes['A'].value = true;
  simulate(c);
  assert(!isSolved(c), 'Passthrough: A=1 → out0=1 ≠ target false');
}

// ── Summary ───────────────────────────────────────────────────────────────────
console.log(`\n${'─'.repeat(40)}`);
console.log(`  ${passed} passed  |  ${failed} failed`);
console.log('─'.repeat(40));
if (failed > 0) process.exit(1);
