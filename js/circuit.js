import { NODE_TYPE, GATE, GATE_W, GATE_H, NODE_RADIUS } from './constants.js';

export function evalGate(type, inputs) {
  switch (type) {
    case GATE.AND:  return inputs.every(Boolean);
    case GATE.OR:   return inputs.some(Boolean);
    case GATE.NOT:  return !inputs[0];
    case GATE.XOR:  return inputs.reduce((a, b) => a !== b, false);
    case GATE.NAND: return !inputs.every(Boolean);
    case GATE.NOR:  return !inputs.some(Boolean);
    case GATE.XNOR: return inputs.length === 2
      ? inputs[0] === inputs[1]
      : !inputs.reduce((a, b) => a !== b, false);
    default: return false;
  }
}

export function buildCircuit(levelDesc) {
  const nodes = {};
  const inputIds = [];

  for (const inp of levelDesc.inputs) {
    nodes[inp.id] = {
      id: inp.id,
      type: NODE_TYPE.INPUT,
      x: inp.x,
      y: inp.y,
      value: inp.initialValue ?? false,
      label: inp.label ?? inp.id,
      inputIds: [],
      outputIds: [],
    };
    inputIds.push(inp.id);
  }

  for (const gate of levelDesc.gates) {
    nodes[gate.id] = {
      id: gate.id,
      type: NODE_TYPE.GATE,
      gateType: gate.type,
      x: gate.x,
      y: gate.y,
      value: false,
      inputIds: [],
      outputIds: [],
    };
  }

  // Support both legacy single `output` and new `outputs` array
  const outputDescs = levelDesc.outputs ?? [levelDesc.output];
  const outputIds = [];
  for (const out of outputDescs) {
    nodes[out.id] = {
      id: out.id,
      type: NODE_TYPE.OUTPUT,
      x: out.x,
      y: out.y,
      value: false,
      inputIds: [],
      outputIds: [],
    };
    outputIds.push(out.id);
  }

  const wires = [];
  for (const [fromId, toId] of levelDesc.connections) {
    nodes[fromId].outputIds.push(toId);
    nodes[toId].inputIds.push(fromId);
    wires.push({ fromId, toId, value: false, segments: [] });
  }

  // Support legacy `targetOutput` (single bool) and new `targetPattern` (array)
  let targetPattern;
  if (levelDesc.targetPattern !== undefined) {
    targetPattern = levelDesc.targetPattern;
  } else {
    targetPattern = [levelDesc.targetOutput ?? false];
  }

  const circuit = {
    nodes,
    wires,
    inputIds,
    outputIds,
    targetPattern,
  };

  simulate(circuit);
  // If already solved, find a non-winning initial state
  if (isSolved(circuit)) {
    _findNonWinningState(circuit);
  }
  computeWireRoutes(circuit);
  return circuit;
}

function _findNonWinningState(circuit) {
  const { inputIds, nodes } = circuit;
  const n = inputIds.length;
  for (let mask = 0; mask < (1 << n); mask++) {
    for (let i = 0; i < n; i++) {
      nodes[inputIds[i]].value = !!(mask & (1 << i));
    }
    simulate(circuit);
    if (!isSolved(circuit)) return;
  }
  // All states solve (trivial circuit) — leave as-is
}

export function simulate(circuit) {
  const { nodes, wires } = circuit;

  // Kahn's topological sort
  const inDegree = {};
  for (const id in nodes) inDegree[id] = 0;
  for (const id in nodes) {
    for (const outId of nodes[id].outputIds) {
      inDegree[outId] = (inDegree[outId] || 0) + 1;
    }
  }

  const queue = [];
  for (const id in nodes) {
    if (inDegree[id] === 0) queue.push(id);
  }

  const order = [];
  while (queue.length) {
    const id = queue.shift();
    order.push(id);
    for (const outId of nodes[id].outputIds) {
      inDegree[outId]--;
      if (inDegree[outId] === 0) queue.push(outId);
    }
  }

  for (const id of order) {
    const node = nodes[id];
    if (node.type === NODE_TYPE.INPUT) continue;
    const inputVals = node.inputIds.map(iid => nodes[iid].value);
    if (node.type === NODE_TYPE.GATE) {
      node.value = evalGate(node.gateType, inputVals);
    } else if (node.type === NODE_TYPE.OUTPUT) {
      node.value = inputVals[0] ?? false;
    }
  }

  for (const wire of wires) {
    wire.value = nodes[wire.fromId].value;
  }
}

export function getPortPos(node, isOutput, portIndex = 0, totalPorts = 1) {
  if (node.type === NODE_TYPE.INPUT) {
    return isOutput
      ? { x: node.x + NODE_RADIUS, y: node.y }
      : { x: node.x - NODE_RADIUS, y: node.y };
  }
  if (node.type === NODE_TYPE.OUTPUT) {
    return { x: node.x - NODE_RADIUS, y: node.y };
  }
  // GATE: inputs on left edge, output on right edge
  if (isOutput) {
    return { x: node.x + GATE_W / 2, y: node.y };
  } else {
    const spacing = GATE_H / (totalPorts + 1);
    const offsetY = spacing * (portIndex + 1) - GATE_H / 2;
    return { x: node.x - GATE_W / 2, y: node.y + offsetY };
  }
}

export function computeWireRoutes(circuit) {
  const { nodes, wires } = circuit;
  for (const wire of wires) {
    const fromNode = nodes[wire.fromId];
    const toNode = nodes[wire.toId];

    const toPortIdx = toNode.inputIds.indexOf(wire.fromId);
    const toTotalPorts = toNode.inputIds.length;

    const portOut = getPortPos(fromNode, true, 0, 1);
    const portIn = getPortPos(toNode, false, toPortIdx, toTotalPorts);

    const midX = portOut.x + (portIn.x - portOut.x) / 2;

    if (Math.abs(portOut.y - portIn.y) < 2) {
      wire.segments = [
        { x1: portOut.x, y1: portOut.y, x2: portIn.x, y2: portIn.y },
      ];
    } else {
      wire.segments = [
        { x1: portOut.x, y1: portOut.y, x2: midX,     y2: portOut.y },
        { x1: midX,      y1: portOut.y, x2: midX,      y2: portIn.y  },
        { x1: midX,      y1: portIn.y,  x2: portIn.x,  y2: portIn.y  },
      ];
    }
    wire.portOut = portOut;
    wire.portIn = portIn;
  }
}

export function toggleInput(circuit, id) {
  const node = circuit.nodes[id];
  if (node && node.type === NODE_TYPE.INPUT) {
    node.value = !node.value;
    simulate(circuit);
    computeWireRoutes(circuit);
  }
}

export function isSolved(circuit) {
  return circuit.outputIds.every(
    (id, i) => circuit.nodes[id].value === circuit.targetPattern[i]
  );
}
