import { GATE, CANVAS_W, CANVAS_H } from './constants.js';
import { buildCircuit, simulate, isSolved } from './circuit.js';
import { autoLayoutVertical } from './layout.js';
import { isSatisfiable, findAllSolutions } from './sat.js';

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

  const progress = levelNum - 16; // 0-based progression from first generated level
  const numInputs = Math.min(Math.max(2 + Math.floor(progress / 8), 2), 5);
  const numOutputs = Math.min(2 + Math.floor(progress / 10), 10);
  const numInternalGates = Math.min(Math.max(2 + Math.floor(progress / 5), 2), 7);
  const numGates = numInternalGates + numOutputs; // final gates feed the outputs

  // Build inputs
  const inputs = [];
  const inputIds = [];
  for (let i = 0; i < numInputs; i++) {
    const id = `in_${i}`;
    inputIds.push(id);
    inputs.push({ id, label: String.fromCharCode(65 + i), initialValue: false });
  }

  // Build gate nodes
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
    const availableSources = i === 0
      ? inputIds
      : [...inputIds, ...gateIds.slice(0, i)];

    for (let j = 0; j < needsInputs; j++) {
      const srcId = availableSources[Math.floor(rng() * availableSources.length)];
      connections.push([srcId, gate.id]);
    }
  }

  // Last numOutputs gates feed the outputs
  const outputIds = [];
  const outputs = [];
  for (let i = 0; i < numOutputs; i++) {
    const outId = `out${i}`;
    outputIds.push(outId);
    outputs.push({ id: outId });
    connections.push([gateIds[numGates - numOutputs + i], outId]);
  }

  // Prune floating inputs
  const connectedInputs = new Set(connections.map(([from]) => from));
  for (let i = inputs.length - 1; i >= 0; i--) {
    if (!connectedInputs.has(inputs[i].id)) {
      inputIds.splice(i, 1);
      inputs.splice(i, 1);
    }
  }

  const levelDesc = {
    id: levelNum,
    name: `Level ${levelNum}`,
    description: 'Auto-generated circuit challenge.',
    inputs,
    gates: gateNodes,
    outputs,
    connections,
    targetPattern: new Array(numOutputs).fill(true), // placeholder
    targets: {
      gold: numGates * 4,
      silver: numGates * 9,
      bronze: numGates * 18,
    },
    newGates: [],
    hint: 'Enumerate input combinations systematically.',
  };

  // Auto-layout positions
  autoLayoutVertical(levelDesc, CANVAS_W, CANVAS_H);

  // Use SAT solver to find a valid target pattern
  const totalPatterns = 1 << numOutputs;
  const candidatePatterns = [];
  for (let mask = 0; mask < totalPatterns; mask++) {
    const pattern = [];
    for (let i = 0; i < numOutputs; i++) {
      pattern.push(!!(mask & (1 << i)));
    }
    // Check if this pattern is achievable but not trivially all-winning
    if (isSatisfiable(levelDesc, pattern)) {
      const solutions = findAllSolutions(levelDesc, pattern);
      // Good target: at least 1 solution but not all input combos win
      if (solutions.length > 0 && solutions.length < (1 << inputIds.length)) {
        candidatePatterns.push({ pattern, solutionCount: solutions.length });
      }
    }
  }

  if (candidatePatterns.length > 0) {
    const chosen = candidatePatterns[Math.floor(rng() * candidatePatterns.length)];
    levelDesc.targetPattern = chosen.pattern;

    // Find a non-winning initial state using SAT
    const winningSolutions = findAllSolutions(levelDesc, chosen.pattern);
    const winningMasks = new Set(winningSolutions.map(s => s.mask));
    let nonWinningMask = 0;
    for (let mask = 0; mask < (1 << inputIds.length); mask++) {
      if (!winningMasks.has(mask)) {
        nonWinningMask = mask;
        break;
      }
    }
    for (let i = 0; i < inputs.length; i++) {
      inputs[i].initialValue = !!(nonWinningMask & (1 << i));
    }
  } else {
    // All patterns are trivial — perturb circuit by cycling a gate type until non-trivial
    let perturbed = false;
    for (let g = 0; g < gateNodes.length && !perturbed; g++) {
      const origType = gateNodes[g].type;
      for (const alt of GATE_TYPES) {
        if (alt === origType) continue;
        gateNodes[g].type = alt;
        autoLayoutVertical(levelDesc, CANVAS_W, CANVAS_H);
        for (let mask = 0; mask < totalPatterns; mask++) {
          const pattern = [];
          for (let i = 0; i < numOutputs; i++) pattern.push(!!(mask & (1 << i)));
          if (isSatisfiable(levelDesc, pattern)) {
            const solutions = findAllSolutions(levelDesc, pattern);
            if (solutions.length > 0 && solutions.length < (1 << inputIds.length)) {
              levelDesc.targetPattern = pattern;
              const winningMasks = new Set(solutions.map(s => s.mask));
              let nonWinningMask = 0;
              for (let m = 0; m < (1 << inputIds.length); m++) {
                if (!winningMasks.has(m)) { nonWinningMask = m; break; }
              }
              for (let i = 0; i < inputs.length; i++) {
                inputs[i].initialValue = !!(nonWinningMask & (1 << i));
              }
              perturbed = true;
              break;
            }
          }
        }
        if (perturbed) break;
        gateNodes[g].type = origType; // revert
      }
    }
    if (!perturbed) {
      // Ultimate fallback: brute-force
      const achievable = _findAchievablePatterns(levelDesc, inputIds, outputIds);
      if (achievable.length > 0) {
        levelDesc.targetPattern = achievable[0].pattern;
      }
    }
  }

  return levelDesc;
}

function _rawSimulate(levelDesc, inputValues, outputIds) {
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
  return 0;
}
