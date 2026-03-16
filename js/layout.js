import { NODE_TYPE } from './constants.js';

/**
 * Compute a vertical top-to-bottom layout for a level descriptor.
 * Inputs at top (depth 0), gates in middle rows, outputs at bottom.
 * Mutates x/y on inputs, gates, and outputs in-place.
 */
export function autoLayoutVertical(levelDesc, canvasW, canvasH) {
  // Build adjacency from connections
  const children = {};   // nodeId -> [childId, ...]
  const parents = {};    // nodeId -> [parentId, ...]
  const allIds = new Set();

  for (const inp of levelDesc.inputs) {
    allIds.add(inp.id);
    children[inp.id] = children[inp.id] || [];
    parents[inp.id] = parents[inp.id] || [];
  }
  for (const gate of levelDesc.gates) {
    allIds.add(gate.id);
    children[gate.id] = children[gate.id] || [];
    parents[gate.id] = parents[gate.id] || [];
  }
  const outputDescs = levelDesc.outputs ?? (levelDesc.output ? [levelDesc.output] : []);
  for (const out of outputDescs) {
    allIds.add(out.id);
    children[out.id] = children[out.id] || [];
    parents[out.id] = parents[out.id] || [];
  }

  for (const [fromId, toId] of levelDesc.connections) {
    if (!children[fromId]) children[fromId] = [];
    if (!parents[toId]) parents[toId] = [];
    children[fromId].push(toId);
    parents[toId].push(fromId);
  }

  // Compute depth of each node
  const inputIds = new Set(levelDesc.inputs.map(i => i.id));
  const outputIds = new Set(outputDescs.map(o => o.id));
  const depth = {};

  // Inputs = depth 0
  for (const inp of levelDesc.inputs) {
    depth[inp.id] = 0;
  }

  // Topological order for gates
  // BFS from inputs
  const queue = [...levelDesc.inputs.map(i => i.id)];
  while (queue.length > 0) {
    const id = queue.shift();
    for (const childId of (children[id] || [])) {
      const newDepth = (depth[id] || 0) + 1;
      if (depth[childId] === undefined || newDepth > depth[childId]) {
        depth[childId] = newDepth;
        queue.push(childId);
      }
    }
  }

  // Group nodes by depth, separating inputs, gates, and outputs
  const maxGateDepth = Math.max(0, ...levelDesc.gates.map(g => depth[g.id] || 1));

  // Force all outputs to be one row below the deepest gate
  const outputDepth = maxGateDepth + 1;
  for (const out of outputDescs) {
    depth[out.id] = outputDepth;
  }

  const totalRows = outputDepth + 1;
  const topMargin = 40;
  const bottomMargin = 50; // extra room for output target labels below nodes
  const usableHeight = canvasH - topMargin - bottomMargin;
  const rowSpacing = totalRows > 1 ? usableHeight / (totalRows - 1) : usableHeight;

  // Group by depth
  const rows = {};
  for (const id of allIds) {
    const d = depth[id] ?? 0;
    if (!rows[d]) rows[d] = [];
    rows[d].push(id);
  }

  // Build a lookup for nodes
  const nodeMap = {};
  for (const inp of levelDesc.inputs) nodeMap[inp.id] = inp;
  for (const gate of levelDesc.gates) nodeMap[gate.id] = gate;
  for (const out of outputDescs) nodeMap[out.id] = out;

  // Assign positions
  for (const [d, ids] of Object.entries(rows)) {
    const depthNum = parseInt(d);
    const y = topMargin + depthNum * rowSpacing;
    const count = ids.length;
    for (let i = 0; i < count; i++) {
      const x = canvasW / (count + 1) * (i + 1);
      const node = nodeMap[ids[i]];
      if (node) {
        node.x = x;
        node.y = y;
      }
    }
  }
}
