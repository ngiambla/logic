import { GATE, CANVAS_W, CANVAS_H } from './constants.js';
import { buildCircuit, simulate } from './circuit.js';
import { autoLayoutVertical } from './layout.js';
import { findAllSolutions, isSatisfiable } from './sat.js';

const GATE_TYPES = [GATE.AND, GATE.OR, GATE.NOT, GATE.XOR, GATE.NAND, GATE.NOR, GATE.XNOR];

function xorshift32(seed) {
  let x = (seed >>> 0) || 1;
  return function () {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    return (x >>> 0) / 0xFFFFFFFF;
  };
}

/**
 * Generate a challenge circuit with 5 inputs, 7-9 gates, 3-4 outputs.
 * Uses findAllSolutions() to ensure 4-16 solutions.
 * Regenerates with different seeds if needed.
 */
export function generateChallenge() {
  const baseSeed = Date.now();

  for (let attempt = 0; attempt < 50; attempt++) {
    const seed = ((baseSeed + attempt) * 2654435761) >>> 0;
    const rng = xorshift32(seed);

    const numInputs = 5;
    const numOutputs = 2 + Math.floor(rng() * 9); // 2-10
    const numInternalGates = 7 + Math.floor(rng() * 3); // 7-9
    const numGates = numInternalGates + numOutputs;

    // Build inputs
    const inputs = [];
    const inputIds = [];
    for (let i = 0; i < numInputs; i++) {
      const id = `in_${i}`;
      inputIds.push(id);
      inputs.push({ id, label: String.fromCharCode(65 + i), initialValue: false });
    }

    // Build gates
    const gateNodes = [];
    const gateIds = [];
    for (let i = 0; i < numGates; i++) {
      const gateType = GATE_TYPES[Math.floor(rng() * GATE_TYPES.length)];
      const id = `g${i}`;
      gateIds.push(id);
      gateNodes.push({ id, type: gateType });
    }

    // Build connections
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

    // Wire outputs
    const outputs = [];
    const outputIdsList = [];
    for (let i = 0; i < numOutputs; i++) {
      const outId = `out${i}`;
      outputIdsList.push(outId);
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

    if (inputs.length < 3) continue; // need enough inputs

    const levelDesc = {
      id: 0,
      name: 'CHALLENGE',
      description: 'Find ALL solutions!',
      inputs,
      gates: gateNodes,
      outputs,
      connections,
      targetPattern: new Array(numOutputs).fill(true),
      targets: { gold: 60, silver: 90, bronze: 120 },
      newGates: [],
      hint: 'Find every input combination that produces the target output.',
    };

    autoLayoutVertical(levelDesc, CANVAS_W, CANVAS_H);

    // Try all target patterns and find one with 4-16 solutions
    const totalPatterns = 1 << numOutputs;
    for (let pMask = 0; pMask < totalPatterns; pMask++) {
      const pattern = [];
      for (let i = 0; i < numOutputs; i++) {
        pattern.push(!!(pMask & (1 << i)));
      }

      if (!isSatisfiable(levelDesc, pattern)) continue;

      const solutions = findAllSolutions(levelDesc, pattern);
      if (solutions.length >= 4 && solutions.length <= 16) {
        levelDesc.targetPattern = pattern;

        // Set initial state to non-winning
        const winningMasks = new Set(solutions.map(s => s.mask));
        for (let m = 0; m < (1 << inputIds.length); m++) {
          if (!winningMasks.has(m)) {
            for (let i = 0; i < inputs.length; i++) {
              inputs[i].initialValue = !!(m & (1 << i));
            }
            break;
          }
        }

        return { levelDesc, allSolutions: solutions };
      }
    }
  }

  // If we couldn't generate a good challenge after many attempts, return a simple one
  return generateChallenge(); // retry (with new Date.now())
}

export function createChallengeState(levelDesc, allSolutions) {
  return {
    allSolutions,
    foundSolutions: [],
    startTime: performance.now(),
    timeLimit: 120000,
    finished: false,
  };
}

export function submitSolution(challengeState, circuit) {
  if (challengeState.finished) return { isNew: false, isCorrect: false, totalFound: challengeState.foundSolutions.length, totalPossible: challengeState.allSolutions.length };

  const inputMask = circuit.inputIds.reduce((mask, id, i) => {
    return mask | (circuit.nodes[id].value ? (1 << i) : 0);
  }, 0);

  const isCorrect = challengeState.allSolutions.some(s => s.mask === inputMask);
  const isNew = isCorrect && !challengeState.foundSolutions.some(s => s.mask === inputMask);

  if (isNew) {
    challengeState.foundSolutions.push({ mask: inputMask });
  }

  return {
    isNew,
    isCorrect,
    totalFound: challengeState.foundSolutions.length,
    totalPossible: challengeState.allSolutions.length,
  };
}

export function calcChallengeScore(state) {
  const foundCount = state.foundSolutions.length;
  const elapsed = performance.now() - state.startTime;
  const timeBonus = Math.max(0, Math.floor((state.timeLimit - elapsed) / 100));
  return foundCount * 1000 + timeBonus;
}
