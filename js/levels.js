import { GATE } from './constants.js';

export const LEVELS = [
  // ── Level 1: AND tutorial ──────────────────────────────────────────────────
  {
    id: 1, name: 'AND Gate', newGates: [GATE.AND],
    description: 'Make both outputs show 1.',
    hint: 'AND outputs 1 only when BOTH inputs are 1. Set all inputs to 1.',
    inputs: [
      { id: 'A', label: 'A', initialValue: false },
      { id: 'B', label: 'B', initialValue: false },
      { id: 'C', label: 'C', initialValue: false },
    ],
    gates: [
      { id: 'g0', type: GATE.AND },
      { id: 'g1', type: GATE.AND },
    ],
    outputs: [
      { id: 'out0' },
      { id: 'out1' },
    ],
    connections: [
      ['A','g0'],['B','g0'],
      ['B','g1'],['C','g1'],
      ['g0','out0'],['g1','out1'],
    ],
    targetPattern: [true, true],
    targets: { gold: 5, silver: 12, bronze: 25 },
  },

  // ── Level 2: OR tutorial ───────────────────────────────────────────────────
  {
    id: 2, name: 'OR Gate', newGates: [GATE.OR],
    description: 'Match the target output pattern.',
    hint: 'OR outputs 1 when ANY input is 1. Only one output should be 1.',
    inputs: [
      { id: 'A', label: 'A', initialValue: false },
      { id: 'B', label: 'B', initialValue: false },
      { id: 'C', label: 'C', initialValue: false },
    ],
    gates: [
      { id: 'g0', type: GATE.OR },
      { id: 'g1', type: GATE.OR },
    ],
    outputs: [
      { id: 'out0' },
      { id: 'out1' },
    ],
    connections: [
      ['A','g0'],['B','g0'],
      ['A','g1'],['C','g1'],
      ['g0','out0'],['g1','out1'],
    ],
    targetPattern: [true, false],
    targets: { gold: 4, silver: 10, bronze: 20 },
  },

  // ── Level 3: NOT tutorial ──────────────────────────────────────────────────
  {
    id: 3, name: 'NOT Gate', newGates: [GATE.NOT],
    description: 'Invert the signals.',
    hint: 'NOT flips the signal. A=0 gives 1, A=1 gives 0.',
    inputs: [
      { id: 'A', label: 'A', initialValue: false },
      { id: 'B', label: 'B', initialValue: false },
    ],
    gates: [
      { id: 'g0', type: GATE.NOT },
      { id: 'g1', type: GATE.NOT },
    ],
    outputs: [
      { id: 'out0' },
      { id: 'out1' },
    ],
    connections: [
      ['A','g0'],['g0','out0'],
      ['B','g1'],['g1','out1'],
    ],
    targetPattern: [true, false],
    targets: { gold: 3, silver: 8, bronze: 15 },
  },

  // ── Level 4: XOR tutorial ──────────────────────────────────────────────────
  {
    id: 4, name: 'XOR Gate', newGates: [GATE.XOR],
    description: 'Inputs must differ for output to be 1.',
    hint: 'XOR outputs 1 when inputs are DIFFERENT.',
    inputs: [
      { id: 'A', label: 'A', initialValue: false },
      { id: 'B', label: 'B', initialValue: false },
      { id: 'C', label: 'C', initialValue: false },
    ],
    gates: [
      { id: 'g0', type: GATE.XOR },
      { id: 'g1', type: GATE.XOR },
    ],
    outputs: [
      { id: 'out0' },
      { id: 'out1' },
    ],
    connections: [
      ['A','g0'],['B','g0'],
      ['B','g1'],['C','g1'],
      ['g0','out0'],['g1','out1'],
    ],
    targetPattern: [true, true],
    targets: { gold: 4, silver: 10, bronze: 20 },
  },

  // ── Level 5: NAND tutorial ─────────────────────────────────────────────────
  {
    id: 5, name: 'NAND Gate', newGates: [GATE.NAND],
    description: 'NOT-AND: output is 0 only when all inputs are 1.',
    hint: 'NAND is NOT-AND. Output is 0 only when BOTH inputs are 1.',
    inputs: [
      { id: 'A', label: 'A', initialValue: true },
      { id: 'B', label: 'B', initialValue: true },
      { id: 'C', label: 'C', initialValue: true },
    ],
    gates: [
      { id: 'g0', type: GATE.NAND },
      { id: 'g1', type: GATE.NAND },
    ],
    outputs: [
      { id: 'out0' },
      { id: 'out1' },
    ],
    connections: [
      ['A','g0'],['B','g0'],
      ['B','g1'],['C','g1'],
      ['g0','out0'],['g1','out1'],
    ],
    targetPattern: [false, true],
    targets: { gold: 4, silver: 10, bronze: 20 },
  },

  // ── Level 6: NOR tutorial ──────────────────────────────────────────────────
  {
    id: 6, name: 'NOR Gate', newGates: [GATE.NOR],
    description: 'NOT-OR: output is 1 only when all inputs are 0.',
    hint: 'NOR outputs 1 only when ALL inputs are 0.',
    inputs: [
      { id: 'A', label: 'A', initialValue: false },
      { id: 'B', label: 'B', initialValue: false },
      { id: 'C', label: 'C', initialValue: false },
    ],
    gates: [
      { id: 'g0', type: GATE.NOR },
      { id: 'g1', type: GATE.NOR },
    ],
    outputs: [
      { id: 'out0' },
      { id: 'out1' },
    ],
    connections: [
      ['A','g0'],['B','g0'],
      ['B','g1'],['C','g1'],
      ['g0','out0'],['g1','out1'],
    ],
    targetPattern: [true, false],
    targets: { gold: 4, silver: 10, bronze: 20 },
  },

  // ── Level 7: XNOR tutorial ────────────────────────────────────────────────
  {
    id: 7, name: 'XNOR Gate', newGates: [GATE.XNOR],
    description: 'Inputs must match for output to be 1.',
    hint: 'XNOR outputs 1 when inputs are the SAME.',
    inputs: [
      { id: 'A', label: 'A', initialValue: false },
      { id: 'B', label: 'B', initialValue: false },
      { id: 'C', label: 'C', initialValue: false },
    ],
    gates: [
      { id: 'g0', type: GATE.XNOR },
      { id: 'g1', type: GATE.XNOR },
    ],
    outputs: [
      { id: 'out0' },
      { id: 'out1' },
    ],
    connections: [
      ['A','g0'],['B','g0'],
      ['B','g1'],['C','g1'],
      ['g0','out0'],['g1','out1'],
    ],
    targetPattern: [true, false],
    targets: { gold: 4, silver: 10, bronze: 20 },
  },

  // ── Level 8: Triple AND ───────────────────────────────────────────────────
  {
    id: 8, name: 'Triple AND', newGates: [],
    description: 'Chain AND gates, invert the carry.',
    hint: 'Both outputs must match. A 3-input AND requires all three inputs to be 1.',
    inputs: [
      { id: 'A', label: 'A', initialValue: false },
      { id: 'B', label: 'B', initialValue: false },
      { id: 'C', label: 'C', initialValue: false },
    ],
    gates: [
      { id: 'g0', type: GATE.AND },
      { id: 'g1', type: GATE.AND },
      { id: 'g2', type: GATE.NOT },
    ],
    outputs: [
      { id: 'out0' },
      { id: 'out1' },
    ],
    connections: [
      ['A','g0'],['B','g0'],
      ['g0','g1'],['C','g1'],
      ['C','g2'],
      ['g1','out0'],['g2','out1'],
    ],
    targetPattern: [true, false],
    targets: { gold: 7, silver: 16, bronze: 32 },
  },

  // ── Level 9: Half Adder ───────────────────────────────────────────────────
  {
    id: 9, name: 'Half Adder', newGates: [],
    description: 'Compute sum=1, carry=0.',
    hint: 'XOR gives the sum, AND gives the carry. When is sum=1 and carry=0?',
    inputs: [
      { id: 'A', label: 'A', initialValue: false },
      { id: 'B', label: 'B', initialValue: false },
    ],
    gates: [
      { id: 'g0', type: GATE.XOR },
      { id: 'g1', type: GATE.AND },
    ],
    outputs: [
      { id: 'out0' },
      { id: 'out1' },
    ],
    connections: [
      ['A','g0'],['B','g0'],['g0','out0'],
      ['A','g1'],['B','g1'],['g1','out1'],
    ],
    targetPattern: [true, false],
    targets: { gold: 5, silver: 12, bronze: 25 },
  },

  // ── Level 10: AND into OR ─────────────────────────────────────────────────
  {
    id: 10, name: 'AND into OR', newGates: [],
    description: '(A AND B) feeds into OR, B is inverted separately.',
    hint: 'Make OR output 1 and NOT output 0 simultaneously.',
    inputs: [
      { id: 'A', label: 'A', initialValue: false },
      { id: 'B', label: 'B', initialValue: false },
      { id: 'C', label: 'C', initialValue: false },
    ],
    gates: [
      { id: 'g0', type: GATE.AND },
      { id: 'g1', type: GATE.OR  },
      { id: 'g2', type: GATE.NOT },
    ],
    outputs: [
      { id: 'out0' },
      { id: 'out1' },
    ],
    connections: [
      ['A','g0'],['B','g0'],
      ['g0','g1'],['C','g1'],
      ['B','g2'],
      ['g1','out0'],['g2','out1'],
    ],
    targetPattern: [true, false],
    targets: { gold: 7, silver: 17, bronze: 35 },
  },

  // ── Level 11: Fan-out ─────────────────────────────────────────────────────
  {
    id: 11, name: 'Fan-out', newGates: [],
    description: 'A drives two gates. Merge and XOR the results.',
    hint: 'OR(NOT(A), AND(A,B)) = 1 always when A=0. XOR=1 when A\u2260B.',
    inputs: [
      { id: 'A', label: 'A', initialValue: false },
      { id: 'B', label: 'B', initialValue: false },
    ],
    gates: [
      { id: 'g0', type: GATE.NOT },
      { id: 'g1', type: GATE.AND },
      { id: 'g2', type: GATE.OR  },
      { id: 'g3', type: GATE.XOR },
    ],
    outputs: [
      { id: 'out0' },
      { id: 'out1' },
    ],
    connections: [
      ['A','g0'],
      ['A','g1'],['B','g1'],
      ['g0','g2'],['g1','g2'],
      ['A','g3'],['B','g3'],
      ['g2','out0'],['g3','out1'],
    ],
    targetPattern: [true, true],
    targets: { gold: 8, silver: 20, bronze: 40 },
  },

  // ── Level 12: Majority Vote ───────────────────────────────────────────────
  {
    id: 12, name: 'Majority Vote', newGates: [],
    description: 'Output 1 when 2+ inputs are 1.',
    hint: '(A AND B) OR (B AND C) = 1 when at least two inputs are 1.',
    inputs: [
      { id: 'A', label: 'A', initialValue: false },
      { id: 'B', label: 'B', initialValue: false },
      { id: 'C', label: 'C', initialValue: false },
    ],
    gates: [
      { id: 'g0', type: GATE.AND },
      { id: 'g1', type: GATE.AND },
      { id: 'g2', type: GATE.OR  },
      { id: 'g3', type: GATE.XOR },
    ],
    outputs: [
      { id: 'out0' },
      { id: 'out1' },
    ],
    connections: [
      ['A','g0'],['B','g0'],
      ['B','g1'],['C','g1'],
      ['g0','g2'],['g1','g2'],
      ['A','g3'],['C','g3'],
      ['g2','out0'],['g3','out1'],
    ],
    targetPattern: [true, true],
    targets: { gold: 9, silver: 22, bronze: 44 },
  },

  // ── Level 13: 2:1 Multiplexer ─────────────────────────────────────────────
  {
    id: 13, name: '2:1 Multiplexer', newGates: [],
    description: 'S selects D0 (S=0) or D1 (S=1).',
    hint: 'MUX = (NOT(S) AND D0) OR (S AND D1). Set S=0, D0=1 to pass D0.',
    inputs: [
      { id: 'S',  label: 'S',  initialValue: false },
      { id: 'D0', label: 'D0', initialValue: false },
      { id: 'D1', label: 'D1', initialValue: false },
    ],
    gates: [
      { id: 'g0', type: GATE.NOT },
      { id: 'g1', type: GATE.AND },
      { id: 'g2', type: GATE.AND },
      { id: 'g3', type: GATE.OR  },
      { id: 'g4', type: GATE.AND },
    ],
    outputs: [
      { id: 'out0' },
      { id: 'out1' },
    ],
    connections: [
      ['S','g0'],
      ['g0','g1'],['D0','g1'],
      ['S','g2'],['D1','g2'],
      ['g1','g3'],['g2','g3'],
      ['S','g4'],['D0','g4'],
      ['g3','out0'],['g4','out1'],
    ],
    targetPattern: [true, false],
    targets: { gold: 10, silver: 25, bronze: 50 },
  },

  // ── Level 14: Full Adder Sum ──────────────────────────────────────────────
  {
    id: 14, name: 'Full Adder Sum', newGates: [],
    description: 'Compute full adder sum=1 and partial carry=0.',
    hint: 'Sum = XOR(XOR(A,B), Cin). Set exactly one of A,B to 1 with Cin=0.',
    inputs: [
      { id: 'A',   label: 'A',   initialValue: false },
      { id: 'B',   label: 'B',   initialValue: false },
      { id: 'Cin', label: 'Cin', initialValue: false },
    ],
    gates: [
      { id: 'g0', type: GATE.XOR },
      { id: 'g1', type: GATE.XOR },
      { id: 'g2', type: GATE.AND },
    ],
    outputs: [
      { id: 'out0' },
      { id: 'out1' },
    ],
    connections: [
      ['A','g0'],['B','g0'],
      ['g0','g1'],['Cin','g1'],
      ['A','g2'],['B','g2'],
      ['g1','out0'],['g2','out1'],
    ],
    targetPattern: [true, false],
    targets: { gold: 8, silver: 20, bronze: 40 },
  },

  // ── Level 15: Logic Master ────────────────────────────────────────────────
  {
    id: 15, name: 'Logic Master', newGates: [],
    description: 'The final challenge. Master all gates.',
    hint: 'Try A=0, B=1, C=0, D=0.',
    inputs: [
      { id: 'A', label: 'A', initialValue: true },
      { id: 'B', label: 'B', initialValue: true },
      { id: 'C', label: 'C', initialValue: true },
      { id: 'D', label: 'D', initialValue: true },
    ],
    gates: [
      { id: 'g0', type: GATE.NAND },
      { id: 'g1', type: GATE.NOR  },
      { id: 'g2', type: GATE.XOR  },
      { id: 'g3', type: GATE.AND  },
      { id: 'g4', type: GATE.XNOR },
      { id: 'g5', type: GATE.OR   },
    ],
    outputs: [
      { id: 'out0' },
      { id: 'out1' },
    ],
    connections: [
      ['A','g0'],['B','g0'],
      ['C','g1'],['D','g1'],
      ['g0','g2'],['B','g2'],
      ['g1','g3'],['C','g3'],
      ['g2','g4'],['g3','g4'],
      ['g0','g5'],['g3','g5'],
      ['g4','out0'],['g5','out1'],
    ],
    targetPattern: [true, true],
    targets: { gold: 15, silver: 35, bronze: 70 },
  },
];
