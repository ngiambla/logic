import { GATE, CANVAS_W, CANVAS_H } from './constants.js';
import { buildCircuit, simulate, isSolved } from './circuit.js';

function xorshift32(seed) {
  let x = (seed >>> 0) || 1;
  return function () {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    return (x >>> 0) / 0xFFFFFFFF;
  };
}

const GATE_TYPES = [GATE.AND, GATE.OR, GATE.NOT, GATE.XOR, GATE.NAND, GATE.NOR, GATE.XNOR];

export function generateLevel(levelNum) {
  const seed = (levelNum * 2654435761) >>> 0;
  const rng = xorshift32(seed);

  const numInputs = Math.min(Math.max(2 + Math.floor((levelNum - 41) / 8), 2), 5);
  // numGates includes the 2 final gates that feed the 2 outputs
  const numInternalGates = Math.min(Math.max(2 + Math.floor((levelNum - 41) / 5), 2), 7);
  const numGates = numInternalGates + 2; // +2 for the two output-feeding gates

  // Build inputs
  const inputs = [];
  const inputIds = [];
  for (let i = 0; i < numInputs; i++) {
    const id = `in_${i}`;
    inputIds.push(id);
    inputs.push({ id, label: String.fromCharCode(65 + i), initialValue: false });
  }

  // Build internal gate nodes (indices 0..numInternalGates-1)
  const gateNodes = [];
  const gateIds = [];
  for (let i = 0; i < numGates; i++) {
    const gateType = GATE_TYPES[Math.floor(rng() * GATE_TYPES.length)];
    const id = `g${i}`;
    gateIds.push(id);
    gateNodes.push({ id, type: gateType });
  }

  // Build connections: each gate pulls from earlier nodes
  const connections = [];
  for (let i = 0; i < numGates; i++) {
    const gate = gateNodes[i];
    const needsInputs = gate.type === GATE.NOT ? 1 : 2;
    // Available sources: inputs + any previous gates
    const availableSources = i === 0
      ? inputIds
      : [...inputIds, ...gateIds.slice(0, i)];

    const chosen = new Set();
    for (let j = 0; j < needsInputs; j++) {
      // Pick source; allow duplicates only for single-input gates
      const srcId = availableSources[Math.floor(rng() * availableSources.length)];
      connections.push([srcId, gate.id]);
      chosen.add(srcId);
    }
  }

  // The last two gates feed the two outputs
  const out0Id = 'out0';
  const out1Id = 'out1';
  const lastGate0 = gateIds[numGates - 2];
  const lastGate1 = gateIds[numGates - 1];
  connections.push([lastGate0, out0Id]);
  connections.push([lastGate1, out1Id]);

  // Auto-layout: columns
  const gatesPerCol = Math.max(2, Math.ceil(numGates / 3));
  const numCols = Math.ceil(numGates / gatesPerCol);
  const colWidth = CANVAS_W / (numCols + 2);

  // Position inputs
  for (let i = 0; i < numInputs; i++) {
    const spacing = CANVAS_H / (numInputs + 1);
    inputs[i].x = colWidth * 0.7;
    inputs[i].y = spacing * (i + 1);
  }

  // Position gates
  for (let i = 0; i < numGates; i++) {
    const col = Math.floor(i / gatesPerCol);
    const row = i % gatesPerCol;
    const colCount = Math.min(gatesPerCol, numGates - col * gatesPerCol);
    const colX = colWidth * (col + 1.5);
    const spacing = CANVAS_H / (colCount + 1);
    gateNodes[i].x = colX;
    gateNodes[i].y = spacing * (row + 1);
  }

  // Position outputs
  const outputX = colWidth * (numCols + 1.5);
  const outputs = [
    { id: out0Id, x: outputX, y: CANVAS_H * 0.38 },
    { id: out1Id, x: outputX, y: CANVAS_H * 0.62 },
  ];

  const levelDesc = {
    id: levelNum,
    name: `Level ${levelNum}`,
    description: 'Auto-generated circuit challenge.',
    inputs,
    gates: gateNodes,
    outputs,
    connections,
    targetPattern: [true, true], // placeholder — will be computed below
    targets: {
      gold: numGates * 4,
      silver: numGates * 9,
      bronze: numGates * 18,
    },
    newGates: [],
    hint: 'Enumerate input combinations systematically.',
  };

  // Build a temporary circuit to find achievable output patterns
  // We must do this WITHOUT using buildCircuit (which calls _findNonWinningState)
  // so we do a raw simulation pass.
  const achievable = _findAchievablePatterns(levelDesc, inputIds, [out0Id, out1Id]);

  if (achievable.length === 0) {
    // Degenerate circuit — fall back with a simple target
    levelDesc.targetPattern = [true, false];
    return levelDesc;
  }

  // Choose a random achievable target pattern
  const chosen = achievable[Math.floor(rng() * achievable.length)];
  levelDesc.targetPattern = chosen.pattern;

  // Find a non-winning initial state (different from chosen.mask)
  const nonWinningMask = _findNonWinningMask(
    levelDesc, inputIds, [out0Id, out1Id], chosen.pattern
  );

  // Apply non-winning initial values
  for (let i = 0; i < numInputs; i++) {
    inputs[i].initialValue = !!(nonWinningMask & (1 << i));
  }

  return levelDesc;
}

function _rawSimulate(levelDesc, inputValues, outputIds) {
  // Lightweight simulation without building a full circuit object
  const circuit = buildCircuit(levelDesc);
  const { nodes, inputIds } = circuit;

  for (let i = 0; i < inputIds.length; i++) {
    nodes[inputIds[i]].value = inputValues[i];
  }
  simulate(circuit);
  return outputIds.map(id => nodes[id].value);
}

function _findAchievablePatterns(levelDesc, inputIds, outputIds) {
  const n = inputIds.length;
  const seen = new Map();

  for (let mask = 0; mask < (1 << n); mask++) {
    const inputValues = inputIds.map((_, i) => !!(mask & (1 << i)));
    const pattern = _rawSimulate(levelDesc, inputValues, outputIds);
    const key = pattern.map(v => v ? '1' : '0').join('');
    if (!seen.has(key)) {
      seen.set(key, { mask, pattern });
    }
  }

  return [...seen.values()];
}

function _findNonWinningMask(levelDesc, inputIds, outputIds, targetPattern) {
  const n = inputIds.length;
  for (let mask = 0; mask < (1 << n); mask++) {
    const inputValues = inputIds.map((_, i) => !!(mask & (1 << i)));
    const pattern = _rawSimulate(levelDesc, inputValues, outputIds);
    const matches = pattern.every((v, i) => v === targetPattern[i]);
    if (!matches) return mask;
  }
  return 0; // All states win (trivial) — just return 0
}
