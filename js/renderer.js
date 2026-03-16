import { COLOR, INPUT_COLORS, GATE_LABEL, NODE_TYPE, GATE_W, GATE_H, NODE_RADIUS, PORT_RADIUS } from './constants.js';
import { getPortPos } from './circuit.js';

/** Parse '#rrggbb' → dim rgb string at the given brightness factor (0..1). */
function dimHex(hex, factor) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgb(${Math.round(r * factor)},${Math.round(g * factor)},${Math.round(b * factor)})`;
}

let gridCanvas = null;
let scanlineCanvas = null;

function initOffscreenCanvases(w, h) {
  gridCanvas = document.createElement('canvas');
  gridCanvas.width = w;
  gridCanvas.height = h;
  const gc = gridCanvas.getContext('2d');
  gc.fillStyle = COLOR.GRID;
  for (let x = 0; x < w; x += 20) {
    for (let y = 0; y < h; y += 20) {
      gc.fillRect(x, y, 2, 2);
    }
  }

  scanlineCanvas = document.createElement('canvas');
  scanlineCanvas.width = w;
  scanlineCanvas.height = h;
  const sc = scanlineCanvas.getContext('2d');
  for (let y = 0; y < h; y += 3) {
    sc.fillStyle = 'rgba(0,0,0,0.08)';
    sc.fillRect(0, y + 2, w, 1);
  }
}

function bresenhamLine(ctx, x0, y0, x1, y1) {
  x0 = Math.round(x0); y0 = Math.round(y0);
  x1 = Math.round(x1); y1 = Math.round(y1);
  const dx = Math.abs(x1 - x0), dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;
  while (true) {
    ctx.fillRect(x0, y0, 2, 2);
    if (x0 === x1 && y0 === y1) break;
    const e2 = 2 * err;
    if (e2 > -dy) { err -= dy; x0 += sx; }
    if (e2 < dx)  { err += dx; y0 += sy; }
  }
}

/**
 * Draw a wire segment.
 * @param {string|null} inputColor - when set, use this color (from input palette)
 *                                   instead of the standard signal green.
 */
function drawWire(ctx, wire, high, inputColor = null) {
  const hiColor  = inputColor ?? COLOR.WIRE_HIGH;
  const lowColor = inputColor ? dimHex(inputColor, 0.18) : COLOR.WIRE_LOW;

  ctx.fillStyle = high ? hiColor : lowColor;
  if (high) {
    ctx.shadowColor = hiColor;
    ctx.shadowBlur = 10;
  } else {
    ctx.shadowBlur = 0;
  }
  for (const seg of wire.segments) {
    bresenhamLine(ctx, seg.x1, seg.y1, seg.x2, seg.y2);
  }
  ctx.shadowBlur = 0;
}

export function render(ctx, circuit, uiState) {
  const { nodes, wires } = circuit;
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;

  if (!gridCanvas || gridCanvas.width !== w || gridCanvas.height !== h) {
    initOffscreenCanvases(w, h);
  }

  // Pass 1: Background
  ctx.fillStyle = COLOR.BG;
  ctx.fillRect(0, 0, w, h);

  // Pass 2: Dot grid
  ctx.globalAlpha = 1;
  ctx.drawImage(gridCanvas, 0, 0);

  // Pass 3: LOW wires — use pre-assigned wire.color
  for (const wire of wires) {
    if (!wire.value) {
      drawWire(ctx, wire, false, wire.color || null);
    }
  }

  // Pass 4: HIGH wires
  for (const wire of wires) {
    if (wire.value) {
      drawWire(ctx, wire, true, wire.color || null);
    }
  }

  // Pass 5 & 6: Gates (fill, border, label, port indicators)
  ctx.font = 'bold 13px "Courier New", Courier, monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (const id in nodes) {
    const node = nodes[id];
    if (node.type !== NODE_TYPE.GATE) continue;

    const gx = node.x - GATE_W / 2;
    const gy = node.y - GATE_H / 2;

    // Gate body
    ctx.fillStyle = COLOR.GATE_FILL;
    ctx.strokeStyle = node.value ? COLOR.WIRE_HIGH : COLOR.GATE_BORDER;
    ctx.lineWidth = node.value ? 2 : 1.5;
    ctx.shadowColor = node.value ? COLOR.WIRE_HIGH : COLOR.GATE_BORDER;
    ctx.shadowBlur = node.value ? 10 : 4;
    ctx.fillRect(gx, gy, GATE_W, GATE_H);
    ctx.strokeRect(gx, gy, GATE_W, GATE_H);
    ctx.shadowBlur = 0;

    // Gate label (plain text, monospace)
    ctx.fillStyle = COLOR.ACCENT;
    ctx.fillText(GATE_LABEL[node.gateType] || node.gateType, node.x, node.y);

    // Input port dots on TOP edge
    const totalInputs = node.inputIds.length;
    for (let pi = 0; pi < totalInputs; pi++) {
      const pos = getPortPos(node, false, pi, totalInputs);
      const inputNode = nodes[node.inputIds[pi]];
      const portActive = inputNode ? inputNode.value : false;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, PORT_RADIUS, 0, Math.PI * 2);
      ctx.fillStyle = portActive ? COLOR.WIRE_HIGH : '#2a4a2a';
      ctx.shadowColor = portActive ? COLOR.WIRE_HIGH : 'transparent';
      ctx.shadowBlur = portActive ? 6 : 0;
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Output port dot on BOTTOM edge
    const outPos = getPortPos(node, true, 0, 1);
    ctx.beginPath();
    ctx.arc(outPos.x, outPos.y, PORT_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = node.value ? COLOR.WIRE_HIGH : '#2a4a2a';
    ctx.shadowColor = node.value ? COLOR.WIRE_HIGH : 'transparent';
    ctx.shadowBlur = node.value ? 6 : 0;
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  // Pass 7: Input nodes — each rendered in its assigned distinct color
  ctx.font = 'bold 13px "Courier New", Courier, monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (let idx = 0; idx < circuit.inputIds.length; idx++) {
    const id = circuit.inputIds[idx];
    const node = nodes[id];
    const iColor = INPUT_COLORS[idx % INPUT_COLORS.length];
    const iColorDim = dimHex(iColor, 0.25);      // dark tint when OFF

    // Circle fill: full color when ON, dark tint when OFF
    ctx.beginPath();
    ctx.arc(node.x, node.y, NODE_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = node.value ? iColor : iColorDim;
    ctx.shadowColor = node.value ? iColor : 'transparent';
    ctx.shadowBlur = node.value ? 16 : 0;
    ctx.fill();
    // Border always in the input's color
    ctx.strokeStyle = iColor;
    ctx.lineWidth = node.value ? 2.5 : 1.5;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Value label — dark on lit, same hue on dark
    ctx.fillStyle = node.value ? '#000' : iColor;
    ctx.fillText(node.value ? '1' : '0', node.x, node.y);

    // Node name to the left of input node
    ctx.font = 'bold 11px "Courier New", Courier, monospace';
    ctx.textAlign = 'right';
    ctx.fillStyle = iColor;
    ctx.fillText(node.label || id, node.x - NODE_RADIUS - 6, node.y);
    ctx.textAlign = 'center';
    ctx.font = 'bold 13px "Courier New", Courier, monospace';

    // Output port dot on bottom edge — input's color
    const outPos = getPortPos(node, true, 0, 1);
    ctx.beginPath();
    ctx.arc(outPos.x, outPos.y, PORT_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = node.value ? iColor : iColorDim;
    ctx.shadowColor = node.value ? iColor : 'transparent';
    ctx.shadowBlur = node.value ? 8 : 0;
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  // Pass 8: Output nodes (all of them)
  const allSolved = circuit.outputIds.every(
    (id, i) => nodes[id].value === circuit.targetPattern[i]
  );
  ctx.font = 'bold 13px "Courier New", Courier, monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  for (let i = 0; i < circuit.outputIds.length; i++) {
    const id = circuit.outputIds[i];
    const outNode = nodes[id];
    const target = circuit.targetPattern[i];
    const matched = outNode.value === target;

    ctx.beginPath();
    ctx.arc(outNode.x, outNode.y, NODE_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = outNode.value ? COLOR.OUTPUT_ACTIVE : '#1a0800';
    ctx.shadowColor = outNode.value ? COLOR.OUTPUT_ACTIVE : 'transparent';
    ctx.shadowBlur = outNode.value ? 16 : 0;
    ctx.fill();

    // Border: green if matched, amber otherwise
    ctx.strokeStyle = matched ? COLOR.OUTPUT_MATCHED : COLOR.OUTPUT_TARGET;
    ctx.lineWidth = matched ? 3 : 2;
    ctx.shadowColor = matched ? COLOR.OUTPUT_MATCHED : COLOR.OUTPUT_TARGET;
    ctx.shadowBlur = matched ? 16 : 8;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Current value
    ctx.fillStyle = outNode.value ? '#fff' : '#666';
    ctx.fillText(outNode.value ? '1' : '0', outNode.x, outNode.y);

    // Target label below output node
    ctx.fillStyle = matched ? COLOR.OUTPUT_MATCHED : COLOR.OUTPUT_TARGET;
    ctx.font = 'bold 11px "Courier New", Courier, monospace';
    ctx.fillText(`->${target ? '1' : '0'}`, outNode.x, outNode.y + NODE_RADIUS + 10);
    ctx.font = 'bold 13px "Courier New", Courier, monospace';

    // Input port dot on top edge of output node
    const inPos = getPortPos(outNode, false, 0, 1);
    ctx.beginPath();
    ctx.arc(inPos.x, inPos.y, PORT_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = outNode.value ? COLOR.OUTPUT_ACTIVE : '#2a1000';
    ctx.fill();
  }

  // Pass 9: Wire junction dots at fan-out points
  // Draw a dot where a wire leaves a source that has multiple outputs
  for (const id in nodes) {
    const node = nodes[id];
    if (node.outputIds.length > 1) {
      const pos = getPortPos(node, true, 0, 1);
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, PORT_RADIUS + 1, 0, Math.PI * 2);
      ctx.fillStyle = node.value ? COLOR.WIRE_HIGH : '#2a4a2a';
      ctx.shadowColor = node.value ? COLOR.WIRE_HIGH : 'transparent';
      ctx.shadowBlur = node.value ? 8 : 0;
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  // Pass 10: Scanlines
  ctx.globalAlpha = 0.5;
  ctx.drawImage(scanlineCanvas, 0, 0);
  ctx.globalAlpha = 1;

  // Pass 11: HUD
  if (uiState) {
    ctx.font = 'bold 16px "Courier New", Courier, monospace';
    ctx.textBaseline = 'top';

    if (uiState.challengeMode) {
      // Challenge HUD
      const remaining = (uiState.timeRemaining / 1000).toFixed(1);
      ctx.textAlign = 'left';
      ctx.fillStyle = uiState.timeRemaining < 10000 ? '#ff3333' : COLOR.TIMER;
      ctx.shadowColor = ctx.fillStyle;
      ctx.shadowBlur = 8;
      ctx.fillText(`T:${remaining}s`, 10, 8);

      ctx.textAlign = 'center';
      ctx.fillStyle = COLOR.ACCENT;
      ctx.shadowColor = COLOR.ACCENT;
      ctx.fillText('CHALLENGE', w / 2, 8);

      ctx.textAlign = 'right';
      ctx.fillStyle = COLOR.SCORE;
      ctx.shadowColor = COLOR.SCORE;
      ctx.fillText(`FOUND:${uiState.foundCount}/${uiState.totalCount}`, w - 10, 8);
    } else {
      // Normal HUD
      const elapsed = uiState.elapsedMs ? (uiState.elapsedMs / 1000).toFixed(1) : '0.0';
      ctx.textAlign = 'left';
      ctx.fillStyle = COLOR.TIMER;
      ctx.shadowColor = COLOR.TIMER;
      ctx.shadowBlur = 8;
      ctx.fillText(`T:${elapsed}s`, 10, 8);

      ctx.textAlign = 'center';
      ctx.fillStyle = COLOR.ACCENT;
      ctx.shadowColor = COLOR.ACCENT;
      ctx.fillText(uiState.levelName || '', w / 2, 8);

      ctx.textAlign = 'right';
      ctx.fillStyle = COLOR.SCORE;
      ctx.shadowColor = COLOR.SCORE;
      ctx.fillText(`${uiState.score || 0}pts`, w - 10, 8);
    }

    ctx.shadowBlur = 0;
  }
}
