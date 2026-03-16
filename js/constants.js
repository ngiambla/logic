export const COLOR = {
  BG: '#0d0d0d',
  GRID: '#1a1a1a',
  WIRE_LOW: '#1a4a1a',
  WIRE_HIGH: '#00ff41',
  GATE_BORDER: '#00cc33',
  GATE_FILL: '#001a00',
  INPUT_OFF: '#333333',
  INPUT_ON: '#00ff41',
  OUTPUT_TARGET: '#ff6600',
  OUTPUT_ACTIVE: '#ff4400',
  OUTPUT_MATCHED: '#00ff41',
  ACCENT: '#00ffff',
  TIMER: '#ffff00',
  SCORE: '#ff9900',
};

export const GATE = {
  AND: 'AND',
  OR: 'OR',
  NOT: 'NOT',
  XOR: 'XOR',
  NAND: 'NAND',
  NOR: 'NOR',
  XNOR: 'XNOR',
};

// Plain text labels (terminal style)
export const GATE_LABEL = {
  AND:  'AND',
  OR:   'OR',
  NOT:  'NOT',
  XOR:  'XOR',
  NAND: 'NAND',
  NOR:  'NOR',
  XNOR: 'XNOR',
};

export const NODE_TYPE = {
  INPUT: 'INPUT',
  GATE: 'GATE',
  OUTPUT: 'OUTPUT',
};

// Distinct colors for each input node (and its direct wires).
// Chosen to be clearly distinguishable on a dark CRT background and
// to contrast with gate-signal green.
export const INPUT_COLORS = [
  '#00e5ff',  // cyan
  '#ff4dff',  // magenta
  '#ffd700',  // gold
  '#ff6b35',  // orange
  '#7fff00',  // chartreuse
];

// Distinct colors for wire overlap coloring
export const WIRE_COLORS = [
  '#00e5ff',  // cyan
  '#ff4dff',  // magenta
  '#ffd700',  // gold
  '#ff6b35',  // orange
  '#7fff00',  // chartreuse
  '#ff3366',  // rose
  '#00ff88',  // mint
  '#aa77ff',  // violet
  '#ffaa00',  // amber
  '#33ccff',  // sky
];

// Dynamic canvas sizing (portrait-friendly)
export function getCanvasSize() {
  if (typeof window === 'undefined') {
    return { width: 600, height: 900 };
  }
  const width = Math.max(320, Math.min(window.innerWidth, 600));
  // Use visualViewport if available (accounts for mobile browser chrome)
  const vh = window.visualViewport ? window.visualViewport.height : window.innerHeight;
  const height = Math.max(480, Math.min(vh - 60, width * 1.5));
  return { width, height };
}

// Legacy constants for test compatibility
export const CANVAS_W = 600;
export const CANVAS_H = 900;
export const GATE_W = 84;
export const GATE_H = 50;
export const NODE_RADIUS = 18;
export const PORT_RADIUS = 4;
