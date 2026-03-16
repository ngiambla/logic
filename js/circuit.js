import { NODE_TYPE, GATE, GATE_W, GATE_H, NODE_RADIUS, INPUT_COLORS, WIRE_COLORS } from './constants.js';

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

  // Prune floating inputs (inputs not connected to any gate/output)
  const connectedInputs = new Set(levelDesc.connections.map(([from]) => from));
  for (let i = inputIds.length - 1; i >= 0; i--) {
    if (!connectedInputs.has(inputIds[i])) {
      delete nodes[inputIds[i]];
      inputIds.splice(i, 1);
    }
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
    // Input nodes: output port at BOTTOM
    return isOutput
      ? { x: node.x, y: node.y + NODE_RADIUS }
      : { x: node.x, y: node.y - NODE_RADIUS };
  }
  if (node.type === NODE_TYPE.OUTPUT) {
    // Output nodes: input port at TOP
    return { x: node.x, y: node.y - NODE_RADIUS };
  }
  // GATE: input ports on TOP edge (spaced horizontally), output port on BOTTOM edge center
  if (isOutput) {
    return { x: node.x, y: node.y + GATE_H / 2 };
  } else {
    const spacing = GATE_W / (totalPorts + 1);
    const offsetX = spacing * (portIndex + 1) - GATE_W / 2;
    return { x: node.x + offsetX, y: node.y - GATE_H / 2 };
  }
}

export function computeWireRoutes(circuit) {
  const { nodes, wires } = circuit;
  const OBS_PAD = 4;

  // --- Build gate obstacle bounding boxes ---
  const obstacles = [];
  for (const id in nodes) {
    const node = nodes[id];
    if (node.type === NODE_TYPE.GATE) {
      obstacles.push({
        x1: node.x - GATE_W / 2 - OBS_PAD,
        y1: node.y - GATE_H / 2 - OBS_PAD,
        x2: node.x + GATE_W / 2 + OBS_PAD,
        y2: node.y + GATE_H / 2 + OBS_PAD,
        cx: node.x,
        nodeId: id,
      });
    }
  }

  // --- Discover depth rows from node y-positions ---
  const rowYSet = new Set();
  for (const id in nodes) rowYSet.add(Math.round(nodes[id].y));
  const sortedRowYs = [...rowYSet].sort((a, b) => a - b);

  // Compute routing bands between consecutive rows
  // bandTop = bottom edge of upper row nodes, bandBottom = top edge of lower row nodes
  const bands = [];
  for (let i = 0; i < sortedRowYs.length - 1; i++) {
    const upperY = sortedRowYs[i];
    const lowerY = sortedRowYs[i + 1];
    // Estimate node extent (worst case: gate)
    const bandTop = upperY + GATE_H / 2 + 6;
    const bandBot = lowerY - GATE_H / 2 - 6;
    bands.push({
      y: (bandTop + bandBot) / 2,
      top: bandTop,
      bot: bandBot,
      space: Math.max(10, bandBot - bandTop),
    });
  }

  // --- Phase 1: Compute port positions ---
  for (const wire of wires) {
    const fromNode = nodes[wire.fromId];
    const toNode = nodes[wire.toId];
    const toPortIdx = toNode.inputIds.indexOf(wire.fromId);
    const toTotalPorts = toNode.inputIds.length;
    wire.portOut = getPortPos(fromNode, true, 0, 1);
    wire.portIn = getPortPos(toNode, false, toPortIdx, toTotalPorts);
  }

  // --- Phase 2: Assign each wire to a routing band ---
  const bandWires = {}; // bandIndex -> [{wireIdx, xMin, xMax}, ...]
  const wireBand = new Array(wires.length).fill(-1);

  for (let wi = 0; wi < wires.length; wi++) {
    const wire = wires[wi];

    if (Math.abs(wire.portOut.x - wire.portIn.x) < 2) {
      // Straight vertical — check for obstacle before committing
      let blocked = false;
      const x = wire.portOut.x;
      const yMin = Math.min(wire.portOut.y, wire.portIn.y);
      const yMax = Math.max(wire.portOut.y, wire.portIn.y);
      for (const obs of obstacles) {
        if (obs.nodeId === wire.fromId || obs.nodeId === wire.toId) continue;
        if (x > obs.x1 && x < obs.x2 && yMin < obs.y2 && yMax > obs.y1) {
          blocked = true;
          break;
        }
      }
      if (!blocked) {
        wire.segments = [
          { x1: wire.portOut.x, y1: wire.portOut.y, x2: wire.portIn.x, y2: wire.portIn.y },
        ];
        continue;
      }
      // Blocked straight wire falls through to V-H-V routing
    }

    // Find the best band (between source and dest, closest to midpoint)
    const midY = (wire.portOut.y + wire.portIn.y) / 2;
    let bestIdx = 0;
    let bestDist = Infinity;
    for (let i = 0; i < bands.length; i++) {
      if (bands[i].y < wire.portOut.y - 5 || bands[i].y > wire.portIn.y + 5) continue;
      const d = Math.abs(bands[i].y - midY);
      if (d < bestDist) { bestDist = d; bestIdx = i; }
    }
    // Fallback: closest band overall
    if (bestDist === Infinity) {
      for (let i = 0; i < bands.length; i++) {
        const d = Math.abs(bands[i].y - midY);
        if (d < bestDist) { bestDist = d; bestIdx = i; }
      }
    }

    wireBand[wi] = bestIdx;
    if (!bandWires[bestIdx]) bandWires[bestIdx] = [];
    const xMin = Math.min(wire.portOut.x, wire.portIn.x);
    const xMax = Math.max(wire.portOut.x, wire.portIn.x);
    bandWires[bestIdx].push({ wi, xMin, xMax });
  }

  // --- Phase 3: Channel assignment within each band (greedy interval coloring) ---
  const wireHorizY = new Array(wires.length).fill(0);

  for (const [bIdx, entries] of Object.entries(bandWires)) {
    const band = bands[parseInt(bIdx)];
    // Sort by left x-coordinate
    entries.sort((a, b) => a.xMin - b.xMin);

    // Greedy channel assignment: assign each wire the lowest channel
    // whose existing wires don't overlap in x
    const channels = []; // channel[c] = [{xMin, xMax}, ...]
    const wireChannelIdx = [];

    for (const entry of entries) {
      let assigned = -1;
      for (let c = 0; c < channels.length; c++) {
        const overlaps = channels[c].some(
          seg => seg.xMin < entry.xMax && entry.xMin < seg.xMax
        );
        if (!overlaps) {
          assigned = c;
          channels[c].push({ xMin: entry.xMin, xMax: entry.xMax });
          break;
        }
      }
      if (assigned === -1) {
        assigned = channels.length;
        channels.push([{ xMin: entry.xMin, xMax: entry.xMax }]);
      }
      wireChannelIdx.push({ wi: entry.wi, ch: assigned });
    }

    // Map channel indices to y-values within the band
    const numChannels = channels.length;
    const spacing = numChannels > 1
      ? Math.min(8, band.space / (numChannels + 1))
      : 0;
    for (const { wi, ch } of wireChannelIdx) {
      wireHorizY[wi] = band.y + (ch - (numChannels - 1) / 2) * spacing;
    }
  }

  // --- Phase 4: Build V-H-V segments ---
  for (let wi = 0; wi < wires.length; wi++) {
    if (wireBand[wi] === -1) continue; // already handled (straight)
    const wire = wires[wi];
    const horizY = wireHorizY[wi];
    wire.segments = [
      { x1: wire.portOut.x, y1: wire.portOut.y, x2: wire.portOut.x, y2: horizY },
      { x1: wire.portOut.x, y1: horizY,         x2: wire.portIn.x,  y2: horizY },
      { x1: wire.portIn.x,  y1: horizY,         x2: wire.portIn.x,  y2: wire.portIn.y },
    ];
  }

  // --- Phase 5: Obstacle avoidance for vertical segments passing through gates ---
  for (let wi = 0; wi < wires.length; wi++) {
    const wire = wires[wi];
    const newSegments = [];

    for (const seg of wire.segments) {
      const isVert = Math.abs(seg.x1 - seg.x2) < 1;
      if (!isVert) { newSegments.push(seg); continue; }

      const x = seg.x1;
      const yTop = Math.min(seg.y1, seg.y2);
      const yBot = Math.max(seg.y1, seg.y2);
      const goingDown = seg.y1 <= seg.y2;

      // Find first obstacle this vertical segment crosses (exclude wire's own endpoints)
      let hit = null;
      for (const obs of obstacles) {
        if (obs.nodeId === wire.fromId || obs.nodeId === wire.toId) continue;
        if (x > obs.x1 && x < obs.x2 && yTop < obs.y2 - 1 && yBot > obs.y1 + 1) {
          if (!hit || (goingDown ? obs.y1 < hit.y1 : obs.y1 > hit.y1)) hit = obs;
        }
      }

      if (!hit) { newSegments.push(seg); continue; }

      // Route around: pick side closer to wire's destination x
      const destX = wire.portIn.x;
      let detourX = (destX <= hit.cx) ? hit.x1 : hit.x2;
      // Clamp to canvas bounds
      detourX = Math.max(8, Math.min(detourX, 592));

      if (goingDown) {
        newSegments.push({ x1: x, y1: seg.y1, x2: x, y2: hit.y1 });
        newSegments.push({ x1: x, y1: hit.y1, x2: detourX, y2: hit.y1 });
        newSegments.push({ x1: detourX, y1: hit.y1, x2: detourX, y2: hit.y2 });
        newSegments.push({ x1: detourX, y1: hit.y2, x2: x, y2: hit.y2 });
        newSegments.push({ x1: x, y1: hit.y2, x2: x, y2: seg.y2 });
      } else {
        newSegments.push({ x1: x, y1: seg.y1, x2: x, y2: hit.y2 });
        newSegments.push({ x1: x, y1: hit.y2, x2: detourX, y2: hit.y2 });
        newSegments.push({ x1: detourX, y1: hit.y2, x2: detourX, y2: hit.y1 });
        newSegments.push({ x1: detourX, y1: hit.y1, x2: x, y2: hit.y1 });
        newSegments.push({ x1: x, y1: hit.y1, x2: x, y2: seg.y2 });
      }
    }
    wire.segments = newSegments;
  }

  assignWireColors(circuit);
}

export function segmentsOverlap(seg1, seg2, threshold = 3) {
  // Check if two axis-aligned segments are co-linear and overlap
  const isHoriz1 = Math.abs(seg1.y1 - seg1.y2) < 1;
  const isHoriz2 = Math.abs(seg2.y1 - seg2.y2) < 1;
  const isVert1 = Math.abs(seg1.x1 - seg1.x2) < 1;
  const isVert2 = Math.abs(seg2.x1 - seg2.x2) < 1;

  if (isHoriz1 && isHoriz2) {
    if (Math.abs(seg1.y1 - seg2.y1) > threshold) return false;
    const a1 = Math.min(seg1.x1, seg1.x2), b1 = Math.max(seg1.x1, seg1.x2);
    const a2 = Math.min(seg2.x1, seg2.x2), b2 = Math.max(seg2.x1, seg2.x2);
    return a1 < b2 && a2 < b1;
  }
  if (isVert1 && isVert2) {
    if (Math.abs(seg1.x1 - seg2.x1) > threshold) return false;
    const a1 = Math.min(seg1.y1, seg1.y2), b1 = Math.max(seg1.y1, seg1.y2);
    const a2 = Math.min(seg2.y1, seg2.y2), b2 = Math.max(seg2.y1, seg2.y2);
    return a1 < b2 && a2 < b1;
  }
  return false;
}

export function assignWireColors(circuit) {
  const { wires, inputIds } = circuit;
  // Build a map of input index for input-sourced wires
  const inputIndexMap = {};
  inputIds.forEach((id, i) => { inputIndexMap[id] = i; });

  // Build adjacency: two wires are "adjacent" if any segments overlap
  const adj = wires.map(() => new Set());
  for (let i = 0; i < wires.length; i++) {
    for (let j = i + 1; j < wires.length; j++) {
      let overlaps = false;
      for (const s1 of wires[i].segments) {
        for (const s2 of wires[j].segments) {
          if (segmentsOverlap(s1, s2)) {
            overlaps = true;
            break;
          }
        }
        if (overlaps) break;
      }
      if (overlaps) {
        adj[i].add(j);
        adj[j].add(i);
      }
    }
  }

  // Greedy graph coloring
  const colorIndex = new Array(wires.length).fill(-1);

  // Pre-assign input-sourced wires their input color index
  for (let i = 0; i < wires.length; i++) {
    if (inputIndexMap[wires[i].fromId] !== undefined) {
      colorIndex[i] = inputIndexMap[wires[i].fromId] % INPUT_COLORS.length;
    }
  }

  // Color remaining wires
  for (let i = 0; i < wires.length; i++) {
    if (colorIndex[i] !== -1) continue;
    const usedColors = new Set();
    for (const j of adj[i]) {
      if (colorIndex[j] !== -1) usedColors.add(colorIndex[j]);
    }
    let c = 0;
    while (usedColors.has(c)) c++;
    colorIndex[i] = c;
  }

  // Assign hex color strings
  for (let i = 0; i < wires.length; i++) {
    const ci = colorIndex[i];
    if (inputIndexMap[wires[i].fromId] !== undefined) {
      wires[i].color = INPUT_COLORS[ci % INPUT_COLORS.length];
    } else {
      wires[i].color = WIRE_COLORS[ci % WIRE_COLORS.length];
    }
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
