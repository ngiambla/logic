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

export const CANVAS_W = 900;
export const CANVAS_H = 600;
export const GATE_W = 84;
export const GATE_H = 50;
export const NODE_RADIUS = 18;
export const PORT_RADIUS = 4;
