import { GATE } from './constants.js';

// Layout helpers
// Inputs:  x ~120,  Outputs: x ~760 (2-gate levels) or ~820 (3+ gate levels)
// out0: upper, out1: lower

export const LEVELS = [
  // ── Level 1: AND tutorial ──────────────────────────────────────────────────
  // g0=AND(A,B) → out0   g1=AND(B,C) → out1
  // target [T,T].  init A=F B=F C=F → [F,F] ✓
  // solution A=T B=T C=T → [T,T] ✓
  {
    id: 1, name: 'AND Gate', newGates: [GATE.AND],
    description: 'Make both outputs show 1.',
    hint: 'AND outputs 1 only when BOTH inputs are 1. Set all inputs to 1.',
    inputs: [
      { id: 'A', label: 'A', x: 120, y: 230, initialValue: false },
      { id: 'B', label: 'B', x: 120, y: 300, initialValue: false },
      { id: 'C', label: 'C', x: 120, y: 370, initialValue: false },
    ],
    gates: [
      { id: 'g0', type: GATE.AND, x: 420, y: 245 },
      { id: 'g1', type: GATE.AND, x: 420, y: 355 },
    ],
    outputs: [
      { id: 'out0', x: 660, y: 245 },
      { id: 'out1', x: 660, y: 355 },
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
  // g0=OR(A,B) → out0   g1=OR(A,C) → out1
  // target [T,F].  init A=F B=F C=F → [F,F] ✓
  // solution A=F B=T C=F → [T,F] ✓
  {
    id: 2, name: 'OR Gate', newGates: [GATE.OR],
    description: 'Match the target output pattern.',
    hint: 'OR outputs 1 when ANY input is 1. Only one output should be 1.',
    inputs: [
      { id: 'A', label: 'A', x: 120, y: 230, initialValue: false },
      { id: 'B', label: 'B', x: 120, y: 300, initialValue: false },
      { id: 'C', label: 'C', x: 120, y: 370, initialValue: false },
    ],
    gates: [
      { id: 'g0', type: GATE.OR, x: 420, y: 245 },
      { id: 'g1', type: GATE.OR, x: 420, y: 355 },
    ],
    outputs: [
      { id: 'out0', x: 660, y: 245 },
      { id: 'out1', x: 660, y: 355 },
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
  // g0=NOT(A) → out0   g1=NOT(B) → out1
  // target [T,F].  init A=F B=F → [T,T] ✓
  // solution A=F B=T → [T,F] ✓
  {
    id: 3, name: 'NOT Gate', newGates: [GATE.NOT],
    description: 'Invert the signals.',
    hint: 'NOT flips the signal. A=0 gives 1, A=1 gives 0.',
    inputs: [
      { id: 'A', label: 'A', x: 120, y: 245, initialValue: false },
      { id: 'B', label: 'B', x: 120, y: 355, initialValue: false },
    ],
    gates: [
      { id: 'g0', type: GATE.NOT, x: 420, y: 245 },
      { id: 'g1', type: GATE.NOT, x: 420, y: 355 },
    ],
    outputs: [
      { id: 'out0', x: 660, y: 245 },
      { id: 'out1', x: 660, y: 355 },
    ],
    connections: [
      ['A','g0'],['g0','out0'],
      ['B','g1'],['g1','out1'],
    ],
    targetPattern: [true, false],
    targets: { gold: 3, silver: 8, bronze: 15 },
  },

  // ── Level 4: XOR tutorial ──────────────────────────────────────────────────
  // g0=XOR(A,B) → out0   g1=XOR(B,C) → out1
  // target [T,T].  init A=F B=F C=F → [F,F] ✓
  // solution A=T B=F C=T → XOR(T,F)=T XOR(F,T)=T ✓
  {
    id: 4, name: 'XOR Gate', newGates: [GATE.XOR],
    description: 'Inputs must differ for output to be 1.',
    hint: 'XOR outputs 1 when inputs are DIFFERENT.',
    inputs: [
      { id: 'A', label: 'A', x: 120, y: 230, initialValue: false },
      { id: 'B', label: 'B', x: 120, y: 300, initialValue: false },
      { id: 'C', label: 'C', x: 120, y: 370, initialValue: false },
    ],
    gates: [
      { id: 'g0', type: GATE.XOR, x: 420, y: 245 },
      { id: 'g1', type: GATE.XOR, x: 420, y: 355 },
    ],
    outputs: [
      { id: 'out0', x: 660, y: 245 },
      { id: 'out1', x: 660, y: 355 },
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
  // g0=NAND(A,B) → out0   g1=NAND(B,C) → out1
  // target [F,T].  init A=T B=T C=T → [F,F] ✓
  // solution A=T B=T C=F → NAND(T,T)=F NAND(T,F)=T ✓
  {
    id: 5, name: 'NAND Gate', newGates: [GATE.NAND],
    description: 'NOT-AND: output is 0 only when all inputs are 1.',
    hint: 'NAND is NOT-AND. Output is 0 only when BOTH inputs are 1.',
    inputs: [
      { id: 'A', label: 'A', x: 120, y: 230, initialValue: true },
      { id: 'B', label: 'B', x: 120, y: 300, initialValue: true },
      { id: 'C', label: 'C', x: 120, y: 370, initialValue: true },
    ],
    gates: [
      { id: 'g0', type: GATE.NAND, x: 420, y: 245 },
      { id: 'g1', type: GATE.NAND, x: 420, y: 355 },
    ],
    outputs: [
      { id: 'out0', x: 660, y: 245 },
      { id: 'out1', x: 660, y: 355 },
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
  // g0=NOR(A,B) → out0   g1=NOR(B,C) → out1
  // target [T,F].  init A=F B=F C=F → [T,T] ✓
  // solution A=F B=F C=T → NOR(F,F)=T NOR(F,T)=F ✓
  {
    id: 6, name: 'NOR Gate', newGates: [GATE.NOR],
    description: 'NOT-OR: output is 1 only when all inputs are 0.',
    hint: 'NOR outputs 1 only when ALL inputs are 0.',
    inputs: [
      { id: 'A', label: 'A', x: 120, y: 230, initialValue: false },
      { id: 'B', label: 'B', x: 120, y: 300, initialValue: false },
      { id: 'C', label: 'C', x: 120, y: 370, initialValue: false },
    ],
    gates: [
      { id: 'g0', type: GATE.NOR, x: 420, y: 245 },
      { id: 'g1', type: GATE.NOR, x: 420, y: 355 },
    ],
    outputs: [
      { id: 'out0', x: 660, y: 245 },
      { id: 'out1', x: 660, y: 355 },
    ],
    connections: [
      ['A','g0'],['B','g0'],
      ['B','g1'],['C','g1'],
      ['g0','out0'],['g1','out1'],
    ],
    targetPattern: [true, false],
    targets: { gold: 4, silver: 10, bronze: 20 },
  },

  // ── Level 7: XNOR tutorial ─────────────────────────────────────────────────
  // g0=XNOR(A,B) → out0   g1=XNOR(B,C) → out1
  // target [T,F].  init A=F B=F C=F → [T,T] ✓
  // solution A=F B=F C=T → XNOR(F,F)=T XNOR(F,T)=F ✓
  {
    id: 7, name: 'XNOR Gate', newGates: [GATE.XNOR],
    description: 'Inputs must match for output to be 1.',
    hint: 'XNOR outputs 1 when inputs are the SAME.',
    inputs: [
      { id: 'A', label: 'A', x: 120, y: 230, initialValue: false },
      { id: 'B', label: 'B', x: 120, y: 300, initialValue: false },
      { id: 'C', label: 'C', x: 120, y: 370, initialValue: false },
    ],
    gates: [
      { id: 'g0', type: GATE.XNOR, x: 420, y: 245 },
      { id: 'g1', type: GATE.XNOR, x: 420, y: 355 },
    ],
    outputs: [
      { id: 'out0', x: 660, y: 245 },
      { id: 'out1', x: 660, y: 355 },
    ],
    connections: [
      ['A','g0'],['B','g0'],
      ['B','g1'],['C','g1'],
      ['g0','out0'],['g1','out1'],
    ],
    targetPattern: [true, false],
    targets: { gold: 4, silver: 10, bronze: 20 },
  },

  // ── Level 8: 3-input AND chain ─────────────────────────────────────────────
  // g0=AND(A,B), g1=AND(g0,C) → out0   g2=NOT(C) → out1
  // target [T,F].  init all F → g0=F g1=F g2=T → [F,T] ✓
  // solution A=T B=T C=T → g0=T g1=T g2=F → [T,F] ✓
  {
    id: 8, name: 'Triple AND', newGates: [],
    description: 'Chain AND gates, invert the carry.',
    hint: 'Both outputs must match. A 3-input AND requires all three inputs to be 1.',
    inputs: [
      { id: 'A', label: 'A', x: 100, y: 210, initialValue: false },
      { id: 'B', label: 'B', x: 100, y: 300, initialValue: false },
      { id: 'C', label: 'C', x: 100, y: 390, initialValue: false },
    ],
    gates: [
      { id: 'g0', type: GATE.AND, x: 300, y: 255 },
      { id: 'g1', type: GATE.AND, x: 480, y: 255 },
      { id: 'g2', type: GATE.NOT, x: 300, y: 390 },
    ],
    outputs: [
      { id: 'out0', x: 680, y: 255 },
      { id: 'out1', x: 680, y: 390 },
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

  // ── Level 9: AND+NOT (NAND from primitives) ────────────────────────────────
  // g0=AND(A,B), g1=NOT(g0) → out0   g2=OR(A,B) → out1
  // target [F,T].  init A=F B=F → [T,F] ✓
  // solution A=T B=T → g0=T g1=F g2=T → [F,T] ✓
  {
    id: 9, name: 'NAND from Scratch', newGates: [],
    description: 'Build NAND from AND+NOT, OR separately.',
    hint: 'AND then NOT = NAND. When do both outputs match [0,1]?',
    inputs: [
      { id: 'A', label: 'A', x: 100, y: 245, initialValue: false },
      { id: 'B', label: 'B', x: 100, y: 355, initialValue: false },
    ],
    gates: [
      { id: 'g0', type: GATE.AND, x: 300, y: 245 },
      { id: 'g1', type: GATE.NOT, x: 480, y: 245 },
      { id: 'g2', type: GATE.OR,  x: 300, y: 390 },
    ],
    outputs: [
      { id: 'out0', x: 680, y: 245 },
      { id: 'out1', x: 680, y: 390 },
    ],
    connections: [
      ['A','g0'],['B','g0'],
      ['g0','g1'],
      ['A','g2'],['B','g2'],
      ['g1','out0'],['g2','out1'],
    ],
    targetPattern: [false, true],
    targets: { gold: 6, silver: 15, bronze: 30 },
  },

  // ── Level 10: OR+NOT (NOR from primitives) ─────────────────────────────────
  // g0=OR(A,B), g1=NOT(g0) → out0   g2=AND(A,B) → out1
  // target [F,T].  init A=F B=F → [T,F] ✓
  // solution A=T B=T → g0=T g1=F g2=T → [F,T] ✓
  {
    id: 10, name: 'NOR from Scratch', newGates: [],
    description: 'Build NOR from OR+NOT, AND separately.',
    hint: 'OR then NOT = NOR. When are both outputs [0,1]?',
    inputs: [
      { id: 'A', label: 'A', x: 100, y: 245, initialValue: false },
      { id: 'B', label: 'B', x: 100, y: 355, initialValue: false },
    ],
    gates: [
      { id: 'g0', type: GATE.OR,  x: 300, y: 245 },
      { id: 'g1', type: GATE.NOT, x: 480, y: 245 },
      { id: 'g2', type: GATE.AND, x: 300, y: 390 },
    ],
    outputs: [
      { id: 'out0', x: 680, y: 245 },
      { id: 'out1', x: 680, y: 390 },
    ],
    connections: [
      ['A','g0'],['B','g0'],
      ['g0','g1'],
      ['A','g2'],['B','g2'],
      ['g1','out0'],['g2','out1'],
    ],
    targetPattern: [false, true],
    targets: { gold: 6, silver: 15, bronze: 30 },
  },

  // ── Level 11: Half adder ───────────────────────────────────────────────────
  // g0=XOR(A,B) → out0 (sum)   g1=AND(A,B) → out1 (carry)
  // target [T,F].  init A=F B=F → [F,F] ✓
  // solution A=T B=F → XOR=T AND=F → [T,F] ✓
  {
    id: 11, name: 'Half Adder', newGates: [],
    description: 'Compute sum=1, carry=0.',
    hint: 'XOR gives the sum, AND gives the carry. When is sum=1 and carry=0?',
    inputs: [
      { id: 'A', label: 'A', x: 120, y: 245, initialValue: false },
      { id: 'B', label: 'B', x: 120, y: 355, initialValue: false },
    ],
    gates: [
      { id: 'g0', type: GATE.XOR, x: 420, y: 245 },
      { id: 'g1', type: GATE.AND, x: 420, y: 355 },
    ],
    outputs: [
      { id: 'out0', x: 660, y: 245 },
      { id: 'out1', x: 660, y: 355 },
    ],
    connections: [
      ['A','g0'],['B','g0'],['g0','out0'],
      ['A','g1'],['B','g1'],['g1','out1'],
    ],
    targetPattern: [true, false],
    targets: { gold: 5, silver: 12, bronze: 25 },
  },

  // ── Level 12: AND+OR combo ─────────────────────────────────────────────────
  // g0=AND(A,B), g1=OR(g0,C) → out0   g2=NOT(B) → out1
  // target [T,F].  init A=F B=F C=F → g0=F g1=F g2=T → [F,T] ✓
  // solution A=T B=T C=F → g0=T g1=T g2=F → [T,F] ✓
  {
    id: 12, name: 'AND into OR', newGates: [],
    description: '(A AND B) feeds into OR, B is inverted separately.',
    hint: 'Make OR output 1 and NOT output 0 simultaneously.',
    inputs: [
      { id: 'A', label: 'A', x: 100, y: 210, initialValue: false },
      { id: 'B', label: 'B', x: 100, y: 300, initialValue: false },
      { id: 'C', label: 'C', x: 100, y: 390, initialValue: false },
    ],
    gates: [
      { id: 'g0', type: GATE.AND, x: 300, y: 245 },
      { id: 'g1', type: GATE.OR,  x: 480, y: 300 },
      { id: 'g2', type: GATE.NOT, x: 300, y: 390 },
    ],
    outputs: [
      { id: 'out0', x: 680, y: 300 },
      { id: 'out1', x: 680, y: 390 },
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

  // ── Level 13: NOT before AND ───────────────────────────────────────────────
  // g0=NOT(A), g1=AND(g0,B) → out0   g2=NOT(B) → out1
  // target [T,F].  init A=F B=F → g0=T g1=F g2=T → [F,T] ✓
  // solution A=F B=T → g0=T g1=T g2=F → [T,F] ✓
  {
    id: 13, name: 'NOT before AND', newGates: [],
    description: 'Invert A before the AND gate.',
    hint: 'NOT(A) AND B = 1 when A=0 and B=1.',
    inputs: [
      { id: 'A', label: 'A', x: 100, y: 245, initialValue: false },
      { id: 'B', label: 'B', x: 100, y: 390, initialValue: false },
    ],
    gates: [
      { id: 'g0', type: GATE.NOT, x: 280, y: 245 },
      { id: 'g1', type: GATE.AND, x: 460, y: 300 },
      { id: 'g2', type: GATE.NOT, x: 280, y: 390 },
    ],
    outputs: [
      { id: 'out0', x: 660, y: 300 },
      { id: 'out1', x: 660, y: 390 },
    ],
    connections: [
      ['A','g0'],['g0','g1'],['B','g1'],
      ['B','g2'],
      ['g1','out0'],['g2','out1'],
    ],
    targetPattern: [true, false],
    targets: { gold: 6, silver: 15, bronze: 30 },
  },

  // ── Level 14: Double NOT ───────────────────────────────────────────────────
  // g0=NOT(A), g1=NOT(g0) → out0   g2=NOT(B) → out1
  // target [T,F].  init A=F B=F → g0=T g1=F g2=T → [F,T] ✓
  // solution A=T B=T → g0=F g1=T g2=F → [T,F] ✓
  {
    id: 14, name: 'Double NOT', newGates: [],
    description: 'Two NOTs cancel. Use it wisely.',
    hint: 'NOT(NOT(x)) = x. Pair with another NOT for the second output.',
    inputs: [
      { id: 'A', label: 'A', x: 100, y: 245, initialValue: false },
      { id: 'B', label: 'B', x: 100, y: 390, initialValue: false },
    ],
    gates: [
      { id: 'g0', type: GATE.NOT, x: 280, y: 245 },
      { id: 'g1', type: GATE.NOT, x: 460, y: 245 },
      { id: 'g2', type: GATE.NOT, x: 280, y: 390 },
    ],
    outputs: [
      { id: 'out0', x: 660, y: 245 },
      { id: 'out1', x: 660, y: 390 },
    ],
    connections: [
      ['A','g0'],['g0','g1'],['g1','out0'],
      ['B','g2'],['g2','out1'],
    ],
    targetPattern: [true, false],
    targets: { gold: 4, silver: 10, bronze: 20 },
  },

  // ── Level 15: OR then AND ──────────────────────────────────────────────────
  // g0=OR(A,B), g1=AND(g0,C) → out0   g2=XOR(A,C) → out1
  // target [T,T].  init A=F B=F C=F → g0=F g1=F g2=F → [F,F] ✓
  // solution A=F B=T C=T → g0=T g1=T XOR(F,T)=T → [T,T] ✓
  {
    id: 15, name: 'OR into AND', newGates: [],
    description: 'Feed OR into AND, XOR on the side.',
    hint: '(A OR B) AND C = 1 needs C=1 and at least one of A,B=1.',
    inputs: [
      { id: 'A', label: 'A', x: 100, y: 200, initialValue: false },
      { id: 'B', label: 'B', x: 100, y: 300, initialValue: false },
      { id: 'C', label: 'C', x: 100, y: 400, initialValue: false },
    ],
    gates: [
      { id: 'g0', type: GATE.OR,  x: 300, y: 245 },
      { id: 'g1', type: GATE.AND, x: 480, y: 310 },
      { id: 'g2', type: GATE.XOR, x: 300, y: 390 },
    ],
    outputs: [
      { id: 'out0', x: 680, y: 310 },
      { id: 'out1', x: 680, y: 390 },
    ],
    connections: [
      ['A','g0'],['B','g0'],
      ['g0','g1'],['C','g1'],
      ['A','g2'],['C','g2'],
      ['g1','out0'],['g2','out1'],
    ],
    targetPattern: [true, true],
    targets: { gold: 7, silver: 18, bronze: 36 },
  },

  // ── Level 16: XOR+NOT ──────────────────────────────────────────────────────
  // g0=XOR(A,B), g1=NOT(g0) → out0   g2=AND(A,B) → out1
  // target [T,F].  init A=T B=F → XOR=T NOT=F AND=F → [F,F] ✓
  // solution A=F B=F → XOR=F NOT=T AND=F → [T,F] ✓
  {
    id: 16, name: 'XOR then NOT', newGates: [],
    description: 'XOR+NOT equals XNOR. AND on the side.',
    hint: 'NOT(XOR(A,B)) = 1 when A and B are the same. AND = 1 only when both are 1.',
    inputs: [
      { id: 'A', label: 'A', x: 100, y: 245, initialValue: true },
      { id: 'B', label: 'B', x: 100, y: 355, initialValue: false },
    ],
    gates: [
      { id: 'g0', type: GATE.XOR, x: 300, y: 245 },
      { id: 'g1', type: GATE.NOT, x: 480, y: 245 },
      { id: 'g2', type: GATE.AND, x: 300, y: 390 },
    ],
    outputs: [
      { id: 'out0', x: 680, y: 245 },
      { id: 'out1', x: 680, y: 390 },
    ],
    connections: [
      ['A','g0'],['B','g0'],['g0','g1'],
      ['A','g2'],['B','g2'],
      ['g1','out0'],['g2','out1'],
    ],
    targetPattern: [true, false],
    targets: { gold: 6, silver: 14, bronze: 28 },
  },

  // ── Level 17: AND + NAND ───────────────────────────────────────────────────
  // g0=AND(A,B), g1=NAND(g0,C) → out0   g2=OR(B,C) → out1
  // target [T,T].  init A=F B=F C=F → g0=F g1=T g2=F → [T,F] ✓
  // solution A=T B=T C=F → g0=T g1=NAND(T,F)=T g2=OR(T,F)=T → [T,T] ✓
  {
    id: 17, name: 'AND + NAND', newGates: [],
    description: 'AND feeds into NAND, OR on the side.',
    hint: 'NAND(AND(A,B), C) = 1 unless both AND(A,B)=1 AND C=1.',
    inputs: [
      { id: 'A', label: 'A', x: 100, y: 200, initialValue: false },
      { id: 'B', label: 'B', x: 100, y: 300, initialValue: false },
      { id: 'C', label: 'C', x: 100, y: 400, initialValue: false },
    ],
    gates: [
      { id: 'g0', type: GATE.AND,  x: 300, y: 245 },
      { id: 'g1', type: GATE.NAND, x: 480, y: 310 },
      { id: 'g2', type: GATE.OR,   x: 300, y: 390 },
    ],
    outputs: [
      { id: 'out0', x: 680, y: 310 },
      { id: 'out1', x: 680, y: 390 },
    ],
    connections: [
      ['A','g0'],['B','g0'],
      ['g0','g1'],['C','g1'],
      ['B','g2'],['C','g2'],
      ['g1','out0'],['g2','out1'],
    ],
    targetPattern: [true, true],
    targets: { gold: 7, silver: 18, bronze: 36 },
  },

  // ── Level 18: OR + XOR ─────────────────────────────────────────────────────
  // g0=OR(A,B), g1=XOR(g0,C) → out0   g2=NOR(A,B) → out1
  // target [T,F].  init A=F B=F C=F → g0=F g1=F g2=T → [F,T] ✓
  // solution A=T B=F C=F → g0=T XOR(T,F)=T NOR(T,F)=F → [T,F] ✓
  {
    id: 18, name: 'OR + XOR', newGates: [],
    description: 'OR feeds XOR, NOR on the side.',
    hint: 'XOR(OR(A,B), C)=1 when OR(A,B) and C differ.',
    inputs: [
      { id: 'A', label: 'A', x: 100, y: 200, initialValue: false },
      { id: 'B', label: 'B', x: 100, y: 300, initialValue: false },
      { id: 'C', label: 'C', x: 100, y: 400, initialValue: false },
    ],
    gates: [
      { id: 'g0', type: GATE.OR,  x: 300, y: 245 },
      { id: 'g1', type: GATE.XOR, x: 480, y: 310 },
      { id: 'g2', type: GATE.NOR, x: 300, y: 390 },
    ],
    outputs: [
      { id: 'out0', x: 680, y: 310 },
      { id: 'out1', x: 680, y: 390 },
    ],
    connections: [
      ['A','g0'],['B','g0'],
      ['g0','g1'],['C','g1'],
      ['A','g2'],['B','g2'],
      ['g1','out0'],['g2','out1'],
    ],
    targetPattern: [true, false],
    targets: { gold: 7, silver: 18, bronze: 36 },
  },

  // ── Level 19: NOR + AND ─────────────────────────────────────────────────────
  // g0=NOR(A,B), g1=AND(g0,C) → out0   g2=XOR(A,B) → out1
  // target [T,F].  init A=F B=F C=F → g0=T g1=F g2=F → [F,F] ✓
  // solution A=F B=F C=T → g0=T g1=T XOR(F,F)=F → [T,F] ✓
  {
    id: 19, name: 'NOR + AND', newGates: [],
    description: 'NOR feeds AND, XOR on the side.',
    hint: 'NOR(A,B)=1 only when A=B=0. Then AND needs C=1.',
    inputs: [
      { id: 'A', label: 'A', x: 100, y: 200, initialValue: false },
      { id: 'B', label: 'B', x: 100, y: 300, initialValue: false },
      { id: 'C', label: 'C', x: 100, y: 400, initialValue: false },
    ],
    gates: [
      { id: 'g0', type: GATE.NOR, x: 300, y: 245 },
      { id: 'g1', type: GATE.AND, x: 480, y: 310 },
      { id: 'g2', type: GATE.XOR, x: 300, y: 390 },
    ],
    outputs: [
      { id: 'out0', x: 680, y: 310 },
      { id: 'out1', x: 680, y: 390 },
    ],
    connections: [
      ['A','g0'],['B','g0'],
      ['g0','g1'],['C','g1'],
      ['A','g2'],['B','g2'],
      ['g1','out0'],['g2','out1'],
    ],
    targetPattern: [true, false],
    targets: { gold: 7, silver: 18, bronze: 36 },
  },

  // ── Level 20: XNOR + OR ─────────────────────────────────────────────────────
  // g0=XNOR(A,B), g1=OR(g0,C) → out0   g2=AND(A,C) → out1
  // target [T,T].  init A=F B=F C=F → g0=T g1=T g2=F → [T,F] ✓
  // solution A=T B=F C=T → XNOR(T,F)=F OR(F,T)=T AND(T,T)=T → [T,T] ✓
  {
    id: 20, name: 'XNOR + OR', newGates: [],
    description: 'XNOR feeds OR, AND on the side.',
    hint: 'OR(XNOR(A,B), C)=1 is easy. AND needs both A=1 and C=1.',
    inputs: [
      { id: 'A', label: 'A', x: 100, y: 200, initialValue: false },
      { id: 'B', label: 'B', x: 100, y: 300, initialValue: false },
      { id: 'C', label: 'C', x: 100, y: 400, initialValue: false },
    ],
    gates: [
      { id: 'g0', type: GATE.XNOR, x: 300, y: 245 },
      { id: 'g1', type: GATE.OR,   x: 480, y: 310 },
      { id: 'g2', type: GATE.AND,  x: 300, y: 390 },
    ],
    outputs: [
      { id: 'out0', x: 680, y: 310 },
      { id: 'out1', x: 680, y: 390 },
    ],
    connections: [
      ['A','g0'],['B','g0'],
      ['g0','g1'],['C','g1'],
      ['A','g2'],['C','g2'],
      ['g1','out0'],['g2','out1'],
    ],
    targetPattern: [true, true],
    targets: { gold: 7, silver: 18, bronze: 36 },
  },

  // ── Level 21: Three-gate chain ─────────────────────────────────────────────
  // g0=AND(A,B), g1=OR(g0,C), g2=NOT(g1) → out0   g3=XOR(A,C) → out1
  // target [T,T].  init A=F B=F C=F → NOT(OR(AND=F,F))=T XOR(F,F)=F → [T,F] ✓
  // solution A=T B=F C=F → AND=F OR(F,F)=F NOT=T XOR(T,F)=T → [T,T] ✓
  {
    id: 21, name: 'Three Gate Chain', newGates: [],
    description: 'AND → OR → NOT chain, XOR aside.',
    hint: 'NOT(OR(AND(A,B), C))=1 needs OR=0. XOR(A,C)=1 when A≠C.',
    inputs: [
      { id: 'A', label: 'A', x: 80, y: 200, initialValue: false },
      { id: 'B', label: 'B', x: 80, y: 300, initialValue: false },
      { id: 'C', label: 'C', x: 80, y: 400, initialValue: false },
    ],
    gates: [
      { id: 'g0', type: GATE.AND, x: 250, y: 245 },
      { id: 'g1', type: GATE.OR,  x: 420, y: 300 },
      { id: 'g2', type: GATE.NOT, x: 590, y: 300 },
      { id: 'g3', type: GATE.XOR, x: 250, y: 400 },
    ],
    outputs: [
      { id: 'out0', x: 760, y: 300 },
      { id: 'out1', x: 760, y: 400 },
    ],
    connections: [
      ['A','g0'],['B','g0'],
      ['g0','g1'],['C','g1'],
      ['g1','g2'],
      ['A','g3'],['C','g3'],
      ['g2','out0'],['g3','out1'],
    ],
    targetPattern: [true, true],
    targets: { gold: 9, silver: 22, bronze: 44 },
  },

  // ── Level 22: Fan-out ──────────────────────────────────────────────────────
  // g0=NOT(A), g1=AND(A,B), g2=OR(g0,g1) → out0   g3=XOR(A,B) → out1
  // target [T,T].  init A=F B=F → NOT=T AND=F OR=T XOR=F → [T,F] ✓
  // solution A=F B=T → NOT=T AND=F OR=T XOR=T → [T,T] ✓
  {
    id: 22, name: 'Fan-out', newGates: [],
    description: 'A drives two gates. Merge and XOR the results.',
    hint: 'OR(NOT(A), AND(A,B)) = 1 always when A=0. XOR=1 when A≠B.',
    inputs: [
      { id: 'A', label: 'A', x: 100, y: 245, initialValue: false },
      { id: 'B', label: 'B', x: 100, y: 390, initialValue: false },
    ],
    gates: [
      { id: 'g0', type: GATE.NOT, x: 280, y: 200 },
      { id: 'g1', type: GATE.AND, x: 280, y: 310 },
      { id: 'g2', type: GATE.OR,  x: 460, y: 255 },
      { id: 'g3', type: GATE.XOR, x: 280, y: 400 },
    ],
    outputs: [
      { id: 'out0', x: 660, y: 255 },
      { id: 'out1', x: 660, y: 400 },
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

  // ── Level 23: Majority vote ────────────────────────────────────────────────
  // g0=AND(A,B), g1=AND(B,C), g2=OR(g0,g1) → out0   g3=XOR(A,C) → out1
  // target [T,T].  init all F → [F,F] ✓
  // solution A=T B=T C=F → AND(T,T)=T AND(T,F)=F OR=T XOR(T,F)=T → [T,T] ✓
  {
    id: 23, name: 'Majority Vote', newGates: [],
    description: 'Output 1 when 2+ inputs are 1.',
    hint: '(A AND B) OR (B AND C) = 1 when at least two inputs are 1.',
    inputs: [
      { id: 'A', label: 'A', x: 80, y: 200, initialValue: false },
      { id: 'B', label: 'B', x: 80, y: 300, initialValue: false },
      { id: 'C', label: 'C', x: 80, y: 400, initialValue: false },
    ],
    gates: [
      { id: 'g0', type: GATE.AND, x: 270, y: 245 },
      { id: 'g1', type: GATE.AND, x: 270, y: 355 },
      { id: 'g2', type: GATE.OR,  x: 460, y: 300 },
      { id: 'g3', type: GATE.XOR, x: 270, y: 430 },
    ],
    outputs: [
      { id: 'out0', x: 660, y: 300 },
      { id: 'out1', x: 660, y: 430 },
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

  // ── Level 24: Cascaded NOTs ────────────────────────────────────────────────
  // g0=NOT(A), g1=NOT(g0), g2=NOT(g1) → out0   g3=AND(g0,B) → out1
  // target [T,F].  init A=T B=T → NOT=F NOT=T NOT=F AND(F,T)=F → [F,F] ✓
  // solution A=F B=F → NOT=T NOT=F NOT=T AND(T,F)=F → [T,F] ✓
  {
    id: 24, name: 'Cascaded NOT', newGates: [],
    description: 'Three NOT gates — odd count inverts.',
    hint: 'NOT(NOT(NOT(A))) = NOT(A). Three NOTs = one NOT.',
    inputs: [
      { id: 'A', label: 'A', x: 80, y: 270, initialValue: true },
      { id: 'B', label: 'B', x: 80, y: 400, initialValue: true },
    ],
    gates: [
      { id: 'g0', type: GATE.NOT, x: 240, y: 270 },
      { id: 'g1', type: GATE.NOT, x: 400, y: 270 },
      { id: 'g2', type: GATE.NOT, x: 560, y: 270 },
      { id: 'g3', type: GATE.AND, x: 400, y: 400 },
    ],
    outputs: [
      { id: 'out0', x: 730, y: 270 },
      { id: 'out1', x: 730, y: 400 },
    ],
    connections: [
      ['A','g0'],['g0','g1'],['g1','g2'],
      ['g0','g3'],['B','g3'],
      ['g2','out0'],['g3','out1'],
    ],
    targetPattern: [true, false],
    targets: { gold: 6, silver: 15, bronze: 30 },
  },

  // ── Level 25: AND-OR network ───────────────────────────────────────────────
  // g0=AND(A,B), g1=AND(C,D), g2=OR(g0,g1) → out0   g3=NOR(A,C) → out1
  // target [T,F].
  // A=T B=T C=F D=F → AND=T AND=F OR=T NOR(T,F)=F → [T,F] ✓
  // init all F → [F,T] ✓
  {
    id: 25, name: 'AND-OR Network', newGates: [],
    description: 'Two ANDs feed an OR, NOR on the side.',
    hint: '(A AND B) OR (C AND D) = 1 needs at least one AND=1.',
    inputs: [
      { id: 'A', label: 'A', x: 80, y: 160, initialValue: false },
      { id: 'B', label: 'B', x: 80, y: 250, initialValue: false },
      { id: 'C', label: 'C', x: 80, y: 350, initialValue: false },
      { id: 'D', label: 'D', x: 80, y: 440, initialValue: false },
    ],
    gates: [
      { id: 'g0', type: GATE.AND, x: 280, y: 200 },
      { id: 'g1', type: GATE.AND, x: 280, y: 395 },
      { id: 'g2', type: GATE.OR,  x: 480, y: 300 },
      { id: 'g3', type: GATE.NOR, x: 480, y: 430 },
    ],
    outputs: [
      { id: 'out0', x: 680, y: 300 },
      { id: 'out1', x: 680, y: 430 },
    ],
    connections: [
      ['A','g0'],['B','g0'],
      ['C','g1'],['D','g1'],
      ['g0','g2'],['g1','g2'],
      ['A','g3'],['C','g3'],
      ['g2','out0'],['g3','out1'],
    ],
    targetPattern: [true, false],
    targets: { gold: 9, silver: 22, bronze: 44 },
  },

  // ── Level 26: NOR tree ─────────────────────────────────────────────────────
  // g0=NOR(A,B), g1=NOR(B,C), g2=NOR(g0,g1) → out0   g3=AND(A,C) → out1
  // target [T,F].
  // B=T A=F C=F → NOR(F,T)=F NOR(T,F)=F NOR(F,F)=T AND(F,F)=F → [T,F] ✓
  // init all F → NOR=T NOR=T NOR(T,T)=F AND=F → [F,F] ✓
  {
    id: 26, name: 'NOR Tree', newGates: [],
    description: 'NOR gates in a tree, AND aside.',
    hint: 'NOR(NOR(A,B), NOR(B,C))=1 needs both NORs to be 0 — needs B=1.',
    inputs: [
      { id: 'A', label: 'A', x: 80, y: 200, initialValue: false },
      { id: 'B', label: 'B', x: 80, y: 300, initialValue: false },
      { id: 'C', label: 'C', x: 80, y: 400, initialValue: false },
    ],
    gates: [
      { id: 'g0', type: GATE.NOR, x: 280, y: 245 },
      { id: 'g1', type: GATE.NOR, x: 280, y: 355 },
      { id: 'g2', type: GATE.NOR, x: 480, y: 300 },
      { id: 'g3', type: GATE.AND, x: 480, y: 430 },
    ],
    outputs: [
      { id: 'out0', x: 680, y: 300 },
      { id: 'out1', x: 680, y: 430 },
    ],
    connections: [
      ['A','g0'],['B','g0'],
      ['B','g1'],['C','g1'],
      ['g0','g2'],['g1','g2'],
      ['A','g3'],['C','g3'],
      ['g2','out0'],['g3','out1'],
    ],
    targetPattern: [true, false],
    targets: { gold: 9, silver: 22, bronze: 44 },
  },

  // ── Level 27: XOR network ──────────────────────────────────────────────────
  // g0=XOR(A,B), g1=XOR(B,C), g2=AND(g0,g1) → out0   g3=NAND(A,C) → out1
  // target [T,T].
  // A=F B=T C=F → XOR(F,T)=T XOR(T,F)=T AND=T NAND(F,F)=T → [T,T] ✓
  // init all F → XOR=F XOR=F AND=F NAND=T → [F,T] ✓
  {
    id: 27, name: 'XOR Network', newGates: [],
    description: 'XOR chain meets AND, NAND on the side.',
    hint: 'XOR(A,B)=1 and XOR(B,C)=1 — try B=1 with A=C=0.',
    inputs: [
      { id: 'A', label: 'A', x: 80, y: 200, initialValue: false },
      { id: 'B', label: 'B', x: 80, y: 300, initialValue: false },
      { id: 'C', label: 'C', x: 80, y: 400, initialValue: false },
    ],
    gates: [
      { id: 'g0', type: GATE.XOR,  x: 280, y: 245 },
      { id: 'g1', type: GATE.XOR,  x: 280, y: 355 },
      { id: 'g2', type: GATE.AND,  x: 480, y: 300 },
      { id: 'g3', type: GATE.NAND, x: 480, y: 430 },
    ],
    outputs: [
      { id: 'out0', x: 680, y: 300 },
      { id: 'out1', x: 680, y: 430 },
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

  // ── Level 28: NAND universal ───────────────────────────────────────────────
  // g0=NAND(A,A)=NOT(A), g1=NAND(B,B)=NOT(B), g2=NAND(g0,g1)=OR(A,B) → out0
  // g3=NAND(A,B) → out1
  // target [T,F].  init A=F B=F → NOT=T NOT=T OR=F NAND=T → [F,T] ✓
  // solution A=T B=T → NOT=F NOT=F OR=T NAND=F → [T,F] ✓
  {
    id: 28, name: 'NAND Universal', newGates: [],
    description: 'Build OR from NANDs, keep plain NAND on the side.',
    hint: 'NAND(A,A)=NOT(A). NAND(NOT(A),NOT(B))=A OR B. NAND(A,B)=0 only when A=B=1.',
    inputs: [
      { id: 'A', label: 'A', x: 80, y: 245, initialValue: false },
      { id: 'B', label: 'B', x: 80, y: 390, initialValue: false },
    ],
    gates: [
      { id: 'g0', type: GATE.NAND, x: 270, y: 200 },
      { id: 'g1', type: GATE.NAND, x: 270, y: 355 },
      { id: 'g2', type: GATE.NAND, x: 460, y: 275 },
      { id: 'g3', type: GATE.NAND, x: 460, y: 420 },
    ],
    outputs: [
      { id: 'out0', x: 660, y: 275 },
      { id: 'out1', x: 660, y: 420 },
    ],
    connections: [
      ['A','g0'],['A','g0'],
      ['B','g1'],['B','g1'],
      ['g0','g2'],['g1','g2'],
      ['A','g3'],['B','g3'],
      ['g2','out0'],['g3','out1'],
    ],
    targetPattern: [true, false],
    targets: { gold: 8, silver: 20, bronze: 40 },
  },

  // ── Level 29: 2:1 Multiplexer ──────────────────────────────────────────────
  // g0=NOT(S), g1=AND(NOT(S),D0), g2=AND(S,D1), g3=OR(g1,g2) → out0
  // g4=AND(S,D0) → out1
  // target [T,F].  init S=F D0=F D1=F → all F → [F,F] ✓
  // solution S=F D0=T D1=F → NOT=T AND(T,T)=T AND(F,F)=F OR=T AND(F,T)=F → [T,F] ✓
  {
    id: 29, name: '2:1 Multiplexer', newGates: [],
    description: 'S selects D0 (S=0) or D1 (S=1).',
    hint: 'MUX = (NOT(S) AND D0) OR (S AND D1). Set S=0, D0=1 to pass D0.',
    inputs: [
      { id: 'S',  label: 'S',  x: 80, y: 180, initialValue: false },
      { id: 'D0', label: 'D0', x: 80, y: 300, initialValue: false },
      { id: 'D1', label: 'D1', x: 80, y: 420, initialValue: false },
    ],
    gates: [
      { id: 'g0', type: GATE.NOT, x: 240, y: 180 },
      { id: 'g1', type: GATE.AND, x: 420, y: 235 },
      { id: 'g2', type: GATE.AND, x: 420, y: 360 },
      { id: 'g3', type: GATE.OR,  x: 600, y: 300 },
      { id: 'g4', type: GATE.AND, x: 420, y: 450 },
    ],
    outputs: [
      { id: 'out0', x: 780, y: 300 },
      { id: 'out1', x: 780, y: 450 },
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

  // ── Level 30: Bit comparator ───────────────────────────────────────────────
  // g0=XNOR(A,B) → out0   g1=AND(A,B) → out1
  // target [T,T].  init A=F B=F → XNOR=T AND=F → [T,F] ✓
  // solution A=T B=T → XNOR=T AND=T → [T,T] ✓
  {
    id: 30, name: 'Bit Comparator', newGates: [],
    description: 'Check equality and both-on conditions.',
    hint: 'XNOR=1 when A=B. AND=1 when both are 1. When are both true simultaneously?',
    inputs: [
      { id: 'A', label: 'A', x: 120, y: 245, initialValue: false },
      { id: 'B', label: 'B', x: 120, y: 355, initialValue: false },
    ],
    gates: [
      { id: 'g0', type: GATE.XNOR, x: 420, y: 245 },
      { id: 'g1', type: GATE.AND,  x: 420, y: 355 },
    ],
    outputs: [
      { id: 'out0', x: 660, y: 245 },
      { id: 'out1', x: 660, y: 355 },
    ],
    connections: [
      ['A','g0'],['B','g0'],['g0','out0'],
      ['A','g1'],['B','g1'],['g1','out1'],
    ],
    targetPattern: [true, true],
    targets: { gold: 5, silver: 12, bronze: 25 },
  },

  // ── Level 31: Priority encoder ─────────────────────────────────────────────
  // g0=NOT(A), g1=AND(NOT(A),B), g2=OR(A,g1) → out0   g3=AND(A,B) → out1
  // target [T,F].  init A=F B=F → NOT=T AND(T,F)=F OR(F,F)=F AND=F → [F,F] ✓
  // solution A=T B=F → NOT=F AND(F,F)=F OR(T,F)=T AND(T,F)=F → [T,F] ✓
  {
    id: 31, name: 'Priority Encoder', newGates: [],
    description: 'A has higher priority than B.',
    hint: 'OR(A, NOT(A) AND B)=1 when any input is active. AND(A,B)=0 when not both active.',
    inputs: [
      { id: 'A', label: 'HI', x: 80, y: 200, initialValue: false },
      { id: 'B', label: 'LO', x: 80, y: 400, initialValue: false },
    ],
    gates: [
      { id: 'g0', type: GATE.NOT, x: 260, y: 200 },
      { id: 'g1', type: GATE.AND, x: 440, y: 300 },
      { id: 'g2', type: GATE.OR,  x: 620, y: 245 },
      { id: 'g3', type: GATE.AND, x: 440, y: 430 },
    ],
    outputs: [
      { id: 'out0', x: 790, y: 245 },
      { id: 'out1', x: 790, y: 430 },
    ],
    connections: [
      ['A','g0'],
      ['g0','g1'],['B','g1'],
      ['A','g2'],['g1','g2'],
      ['A','g3'],['B','g3'],
      ['g2','out0'],['g3','out1'],
    ],
    targetPattern: [true, false],
    targets: { gold: 9, silver: 22, bronze: 44 },
  },

  // ── Level 32: Carry generator ──────────────────────────────────────────────
  // g0=AND(A,B) carry, g1=XOR(A,B) sum. g2=NOT(g0) → out0  g3=XNOR(g0,g1) → out1
  // target [F,F].  init A=F B=F → AND=F NOT=T XOR=F XNOR(F,F)=T → [T,T] ✓
  // solution A=T B=T → AND=T NOT=F XOR=F XNOR(T,F)=F → [F,F] ✓
  {
    id: 32, name: 'Carry Generator', newGates: [],
    description: 'Force carry=1 (NOT carry=0) and XNOR(carry,sum)=0.',
    hint: 'A=B=1 → carry=1, sum=0, NOT(carry)=0, XNOR(1,0)=0.',
    inputs: [
      { id: 'A', label: 'A', x: 100, y: 245, initialValue: false },
      { id: 'B', label: 'B', x: 100, y: 390, initialValue: false },
    ],
    gates: [
      { id: 'g0', type: GATE.AND,  x: 290, y: 310 },
      { id: 'g1', type: GATE.XOR,  x: 290, y: 430 },
      { id: 'g2', type: GATE.NOT,  x: 480, y: 245 },
      { id: 'g3', type: GATE.XNOR, x: 480, y: 390 },
    ],
    outputs: [
      { id: 'out0', x: 680, y: 245 },
      { id: 'out1', x: 680, y: 390 },
    ],
    connections: [
      ['A','g0'],['B','g0'],
      ['A','g1'],['B','g1'],
      ['g0','g2'],
      ['g0','g3'],['g1','g3'],
      ['g2','out0'],['g3','out1'],
    ],
    targetPattern: [false, false],
    targets: { gold: 8, silver: 20, bronze: 40 },
  },

  // ── Level 33: Full adder sum ───────────────────────────────────────────────
  // g0=XOR(A,B), g1=XOR(g0,Cin) → out0 (sum)   g2=AND(A,B) → out1 (partial carry)
  // target [T,F].  init all F → [F,F] ✓
  // solution A=T B=F Cin=F → XOR=T XOR(T,F)=T AND=F → [T,F] ✓
  {
    id: 33, name: 'Full Adder Sum', newGates: [],
    description: 'Compute full adder sum=1 and partial carry=0.',
    hint: 'Sum = XOR(XOR(A,B), Cin). Set exactly one of A,B to 1 with Cin=0.',
    inputs: [
      { id: 'A',   label: 'A',   x: 80, y: 190, initialValue: false },
      { id: 'B',   label: 'B',   x: 80, y: 300, initialValue: false },
      { id: 'Cin', label: 'Cin', x: 80, y: 410, initialValue: false },
    ],
    gates: [
      { id: 'g0', type: GATE.XOR, x: 270, y: 245 },
      { id: 'g1', type: GATE.XOR, x: 460, y: 315 },
      { id: 'g2', type: GATE.AND, x: 270, y: 390 },
    ],
    outputs: [
      { id: 'out0', x: 660, y: 315 },
      { id: 'out1', x: 660, y: 390 },
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

  // ── Level 34: Full adder carry ─────────────────────────────────────────────
  // g0=AND(A,B), g1=XOR(A,B), g2=AND(g1,Cin), g3=OR(g0,g2) → out0 (carry-out)
  // g4=XOR(g1,Cin) → out1 (sum)
  // target [T,T].  init all F → [F,F] ✓
  // solution A=T B=T Cin=T → AND=T XOR=F AND(F,T)=F OR(T,F)=T XOR(F,T)=T → [T,T] ✓
  {
    id: 34, name: 'Full Adder Carry', newGates: [],
    description: 'Full adder: compute carry-out=1 AND sum=1.',
    hint: 'A=B=1, Cin=1 → carry=1, sum=1.',
    inputs: [
      { id: 'A',   label: 'A',   x: 70, y: 175, initialValue: false },
      { id: 'B',   label: 'B',   x: 70, y: 280, initialValue: false },
      { id: 'Cin', label: 'Cin', x: 70, y: 385, initialValue: false },
    ],
    gates: [
      { id: 'g0', type: GATE.AND, x: 240, y: 220 },
      { id: 'g1', type: GATE.XOR, x: 240, y: 330 },
      { id: 'g2', type: GATE.AND, x: 420, y: 360 },
      { id: 'g3', type: GATE.OR,  x: 600, y: 290 },
      { id: 'g4', type: GATE.XOR, x: 420, y: 440 },
    ],
    outputs: [
      { id: 'out0', x: 780, y: 290 },
      { id: 'out1', x: 780, y: 440 },
    ],
    connections: [
      ['A','g0'],['B','g0'],
      ['A','g1'],['B','g1'],
      ['g1','g2'],['Cin','g2'],
      ['g0','g3'],['g2','g3'],
      ['g1','g4'],['Cin','g4'],
      ['g3','out0'],['g4','out1'],
    ],
    targetPattern: [true, true],
    targets: { gold: 12, silver: 28, bronze: 55 },
  },

  // ── Level 35: Four-input AND ───────────────────────────────────────────────
  // g0=AND(A,B), g1=AND(C,D), g2=AND(g0,g1) → out0   g3=OR(A,D) → out1
  // target [T,T].  init all F → AND=F OR=F → [F,F] ✓
  // solution all T → AND=T OR=T → [T,T] ✓
  {
    id: 35, name: 'Four-Input AND', newGates: [],
    description: 'All four inputs must be 1.',
    hint: '(A AND B) AND (C AND D) = 1 requires A=B=C=D=1.',
    inputs: [
      { id: 'A', label: 'A', x: 80, y: 155, initialValue: false },
      { id: 'B', label: 'B', x: 80, y: 255, initialValue: false },
      { id: 'C', label: 'C', x: 80, y: 355, initialValue: false },
      { id: 'D', label: 'D', x: 80, y: 445, initialValue: false },
    ],
    gates: [
      { id: 'g0', type: GATE.AND, x: 280, y: 200 },
      { id: 'g1', type: GATE.AND, x: 280, y: 395 },
      { id: 'g2', type: GATE.AND, x: 480, y: 300 },
      { id: 'g3', type: GATE.OR,  x: 480, y: 440 },
    ],
    outputs: [
      { id: 'out0', x: 680, y: 300 },
      { id: 'out1', x: 680, y: 440 },
    ],
    connections: [
      ['A','g0'],['B','g0'],
      ['C','g1'],['D','g1'],
      ['g0','g2'],['g1','g2'],
      ['A','g3'],['D','g3'],
      ['g2','out0'],['g3','out1'],
    ],
    targetPattern: [true, true],
    targets: { gold: 10, silver: 25, bronze: 50 },
  },

  // ── Level 36: Parity check ─────────────────────────────────────────────────
  // g0=XOR(A,B), g1=XOR(g0,C) → out0 (parity)   g2=NOR(A,C) → out1
  // target [F,T].  init A=T B=F C=F → XOR(T,F)=T XOR(T,F)=T NOR(T,F)=F → [T,F] ✓
  // solution A=F B=F C=F → XOR=F XOR=F NOR=T → [F,T] ✓
  {
    id: 36, name: 'Parity Check', newGates: [],
    description: 'XOR chain computes parity. Make it even (0) with NOR=1.',
    hint: 'Even parity (XOR=0) needs even count of 1s. NOR(A,C)=1 needs A=C=0.',
    inputs: [
      { id: 'A', label: 'A', x: 80, y: 220, initialValue: true },
      { id: 'B', label: 'B', x: 80, y: 310, initialValue: false },
      { id: 'C', label: 'C', x: 80, y: 400, initialValue: false },
    ],
    gates: [
      { id: 'g0', type: GATE.XOR, x: 280, y: 255 },
      { id: 'g1', type: GATE.XOR, x: 460, y: 310 },
      { id: 'g2', type: GATE.NOR, x: 280, y: 400 },
    ],
    outputs: [
      { id: 'out0', x: 660, y: 310 },
      { id: 'out1', x: 660, y: 400 },
    ],
    connections: [
      ['A','g0'],['B','g0'],
      ['g0','g1'],['C','g1'],
      ['A','g2'],['C','g2'],
      ['g1','out0'],['g2','out1'],
    ],
    targetPattern: [false, true],
    targets: { gold: 8, silver: 20, bronze: 40 },
  },

  // ── Level 37: De Morgan I ──────────────────────────────────────────────────
  // g0=NOT(A), g1=NOT(B), g2=OR(g0,g1) → out0   g3=NAND(A,B) → out1
  // target [T,T].  init A=T B=T → NOT=F NOT=F OR=F NAND=F → [F,F] ✓
  // solution A=T B=F → NOT=F NOT=T OR=T NAND=T → [T,T] ✓
  {
    id: 37, name: "De Morgan I", newGates: [],
    description: 'NOT(A) OR NOT(B) = NAND(A,B). Verify De Morgan.',
    hint: 'NOT(A) OR NOT(B) equals NAND(A,B) always. Make both outputs 1.',
    inputs: [
      { id: 'A', label: 'A', x: 80, y: 245, initialValue: true },
      { id: 'B', label: 'B', x: 80, y: 390, initialValue: true },
    ],
    gates: [
      { id: 'g0', type: GATE.NOT,  x: 260, y: 245 },
      { id: 'g1', type: GATE.NOT,  x: 260, y: 390 },
      { id: 'g2', type: GATE.OR,   x: 460, y: 310 },
      { id: 'g3', type: GATE.NAND, x: 460, y: 430 },
    ],
    outputs: [
      { id: 'out0', x: 660, y: 310 },
      { id: 'out1', x: 660, y: 430 },
    ],
    connections: [
      ['A','g0'],['B','g1'],
      ['g0','g2'],['g1','g2'],
      ['A','g3'],['B','g3'],
      ['g2','out0'],['g3','out1'],
    ],
    targetPattern: [true, true],
    targets: { gold: 10, silver: 25, bronze: 50 },
  },

  // ── Level 38: De Morgan II ─────────────────────────────────────────────────
  // g0=NOT(A), g1=NOT(B), g2=AND(g0,g1) → out0   g3=NOR(A,B) → out1
  // target [T,T].  init A=T B=F → NOT=F NOT=T AND=F NOR=F → [F,F] ✓
  // solution A=F B=F → NOT=T NOT=T AND=T NOR=T → [T,T] ✓
  {
    id: 38, name: "De Morgan II", newGates: [],
    description: 'NOT(A) AND NOT(B) = NOR(A,B). Verify.',
    hint: 'NOT(A) AND NOT(B) = NOR(A,B). Both equal 1 only when A=B=0.',
    inputs: [
      { id: 'A', label: 'A', x: 80, y: 245, initialValue: true },
      { id: 'B', label: 'B', x: 80, y: 390, initialValue: false },
    ],
    gates: [
      { id: 'g0', type: GATE.NOT, x: 260, y: 245 },
      { id: 'g1', type: GATE.NOT, x: 260, y: 390 },
      { id: 'g2', type: GATE.AND, x: 460, y: 310 },
      { id: 'g3', type: GATE.NOR, x: 460, y: 430 },
    ],
    outputs: [
      { id: 'out0', x: 660, y: 310 },
      { id: 'out1', x: 660, y: 430 },
    ],
    connections: [
      ['A','g0'],['B','g1'],
      ['g0','g2'],['g1','g2'],
      ['A','g3'],['B','g3'],
      ['g2','out0'],['g3','out1'],
    ],
    targetPattern: [true, true],
    targets: { gold: 8, silver: 20, bronze: 40 },
  },

  // ── Level 39: 1-of-2 Decoder ──────────────────────────────────────────────
  // g0=NOT(S), g1=AND(NOT(S),EN)→Y0, g2=AND(S,EN)→Y1.  out0←Y0, out1←Y1
  // target [F,T].  init S=F EN=F → NOT=T AND(T,F)=F AND(F,F)=F → [F,F] ✓
  // solution S=T EN=T → NOT=F AND(F,T)=F AND(T,T)=T → [F,T] ✓
  {
    id: 39, name: '1-of-2 Decoder', newGates: [],
    description: 'S selects which output is active (EN must be 1).',
    hint: 'S=0 activates Y0. S=1 activates Y1. EN enables the decoder.',
    inputs: [
      { id: 'S',  label: 'S',  x: 80, y: 220, initialValue: false },
      { id: 'EN', label: 'EN', x: 80, y: 380, initialValue: false },
    ],
    gates: [
      { id: 'g0', type: GATE.NOT, x: 260, y: 220 },
      { id: 'g1', type: GATE.AND, x: 460, y: 300 },
      { id: 'g2', type: GATE.AND, x: 460, y: 400 },
    ],
    outputs: [
      { id: 'out0', x: 660, y: 300 },
      { id: 'out1', x: 660, y: 400 },
    ],
    connections: [
      ['S','g0'],
      ['g0','g1'],['EN','g1'],
      ['S','g2'],['EN','g2'],
      ['g1','out0'],['g2','out1'],
    ],
    targetPattern: [false, true],
    targets: { gold: 8, silver: 20, bronze: 40 },
  },

  // ── Level 40: Logic Master ─────────────────────────────────────────────────
  // g0=NAND(A,B), g1=NOR(C,D), g2=XOR(g0,B), g3=AND(g1,C)
  // g4=XNOR(g2,g3) → out0   g5=OR(g0,g3) → out1
  // target [T,T].  init A=T B=T C=T D=T →
  //   g0=NAND(T,T)=F, g1=NOR(T,T)=F, g2=XOR(F,T)=T, g3=AND(F,T)=F
  //   g4=XNOR(T,F)=F, g5=OR(F,F)=F → [F,F] ✓
  // solution A=F B=T C=F D=F →
  //   g0=NAND(F,T)=T, g1=NOR(F,F)=T, g2=XOR(T,T)=F, g3=AND(T,F)=F
  //   g4=XNOR(F,F)=T, g5=OR(T,F)=T → [T,T] ✓
  {
    id: 40, name: 'Logic Master', newGates: [],
    description: 'The final challenge. Master all gates.',
    hint: 'Try A=0, B=1, C=0, D=0.',
    inputs: [
      { id: 'A', label: 'A', x: 60, y: 150, initialValue: true },
      { id: 'B', label: 'B', x: 60, y: 250, initialValue: true },
      { id: 'C', label: 'C', x: 60, y: 350, initialValue: true },
      { id: 'D', label: 'D', x: 60, y: 450, initialValue: true },
    ],
    gates: [
      { id: 'g0', type: GATE.NAND, x: 220, y: 200 },
      { id: 'g1', type: GATE.NOR,  x: 220, y: 400 },
      { id: 'g2', type: GATE.XOR,  x: 410, y: 250 },
      { id: 'g3', type: GATE.AND,  x: 410, y: 400 },
      { id: 'g4', type: GATE.XNOR, x: 600, y: 300 },
      { id: 'g5', type: GATE.OR,   x: 600, y: 430 },
    ],
    outputs: [
      { id: 'out0', x: 790, y: 300 },
      { id: 'out1', x: 790, y: 430 },
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
