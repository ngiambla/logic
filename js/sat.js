import Logic from 'logic-solver';
import { GATE } from './constants.js';

/**
 * Encode a circuit as SAT constraints and return a solver.
 * Each node id is used as a Logic variable name.
 * @param {Object} levelDesc - Level descriptor with inputs, gates, connections, outputs
 * @param {boolean[]} targetPattern - Target output values
 * @returns {Logic.Solver} configured solver
 */
export function encodeCircuit(levelDesc, targetPattern) {
  const solver = new Logic.Solver();

  // Build adjacency: for each node, its input sources
  const inputSources = {};
  for (const [fromId, toId] of levelDesc.connections) {
    if (!inputSources[toId]) inputSources[toId] = [];
    inputSources[toId].push(fromId);
  }

  // Encode each gate's boolean function
  for (const gate of levelDesc.gates) {
    const sources = inputSources[gate.id] || [];
    const out = gate.id;

    switch (gate.type) {
      case GATE.AND:
        // out = AND(sources) — out ↔ (s0 ∧ s1 ∧ ...)
        solver.require(Logic.equiv(out, Logic.and(sources)));
        break;
      case GATE.OR:
        // out = OR(sources)
        solver.require(Logic.equiv(out, Logic.or(sources)));
        break;
      case GATE.NOT:
        // out = NOT(s0)
        solver.require(Logic.equiv(out, Logic.not(sources[0])));
        break;
      case GATE.XOR:
        // out = XOR(s0, s1)
        if (sources.length === 2) {
          solver.require(Logic.equiv(out, Logic.xor(sources[0], sources[1])));
        } else {
          // Multi-input XOR: chain pairwise
          let expr = sources[0];
          for (let i = 1; i < sources.length; i++) {
            expr = Logic.xor(expr, sources[i]);
          }
          solver.require(Logic.equiv(out, expr));
        }
        break;
      case GATE.NAND:
        solver.require(Logic.equiv(out, Logic.not(Logic.and(sources))));
        break;
      case GATE.NOR:
        solver.require(Logic.equiv(out, Logic.not(Logic.or(sources))));
        break;
      case GATE.XNOR:
        if (sources.length === 2) {
          solver.require(Logic.equiv(out, Logic.not(Logic.xor(sources[0], sources[1]))));
        } else {
          let expr = sources[0];
          for (let i = 1; i < sources.length; i++) {
            expr = Logic.xor(expr, sources[i]);
          }
          solver.require(Logic.equiv(out, Logic.not(expr)));
        }
        break;
    }
  }

  // Encode outputs as passthrough from their source
  const outputDescs = levelDesc.outputs ?? (levelDesc.output ? [levelDesc.output] : []);
  for (const out of outputDescs) {
    const sources = inputSources[out.id] || [];
    if (sources.length > 0) {
      solver.require(Logic.equiv(out.id, sources[0]));
    }
  }

  // Constrain outputs to target pattern
  if (targetPattern) {
    for (let i = 0; i < outputDescs.length; i++) {
      if (targetPattern[i]) {
        solver.require(outputDescs[i].id);
      } else {
        solver.require(Logic.not(outputDescs[i].id));
      }
    }
  }

  return solver;
}

/**
 * Check if any input combination produces the given target pattern.
 */
export function isSatisfiable(levelDesc, targetPattern) {
  const solver = encodeCircuit(levelDesc, targetPattern);
  const solution = solver.solve();
  return solution !== null;
}

/**
 * Find all input combinations that produce the given target pattern.
 * Returns array of { mask, inputValues }.
 */
export function findAllSolutions(levelDesc, targetPattern) {
  const inputIds = levelDesc.inputs.map(i => i.id);
  const solutions = [];
  const solver = encodeCircuit(levelDesc, targetPattern);

  let solution = solver.solve();
  while (solution) {
    const inputValues = inputIds.map(id => solution.getTrueVars().includes(id));
    const mask = inputValues.reduce((m, v, i) => m | (v ? (1 << i) : 0), 0);
    solutions.push({ mask, inputValues });

    // Add blocking clause: NOT this exact combination
    const clause = inputIds.map((id, i) => inputValues[i] ? Logic.not(id) : id);
    solver.require(Logic.or(clause));
    solution = solver.solve();
  }

  return solutions;
}

/**
 * Count the number of solutions for a given target pattern.
 */
export function countSolutions(levelDesc, targetPattern) {
  return findAllSolutions(levelDesc, targetPattern).length;
}
