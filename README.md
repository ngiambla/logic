# LOGIC — Circuit Puzzle Game

A retro-styled logic gate puzzle game where you manipulate digital circuits to match target output patterns.

## How to Play

In LOGIC, you control the input signals (0 or 1) to a digital circuit composed of logic gates (AND, OR, NOT, XOR, etc.). Your goal is to set the inputs so that all output nodes match their target values simultaneously.

### Game Mechanics

- **Inputs**: Toggle the leftmost nodes to change their signal from 0 to 1 or vice versa.
- **Gates**: Logic gates process the input signals according to their truth tables:
  - AND: Output 1 only when ALL inputs are 1
  - OR: Output 1 when ANY input is 1
  - NOT: Output is the inverse of the input
  - XOR: Output 1 when inputs are DIFFERENT
  - NAND, NOR, XNOR: Inverted versions of the above
- **Outputs**: The rightmost nodes show the final results. Each output has a target (→1 or →0) that must be matched.
- **Solving**: Find the correct combination of input values that makes all outputs match their targets.

### Levels

- **Levels 1-40**: Hand-crafted tutorial and challenge levels introducing gates progressively.
- **Levels 41+**: Procedurally generated circuits with increasing complexity.

### Scoring

- **Gold Medal**: Solve under target time with speed bonus
- **Silver Medal**: Solve under 2× target time
- **Bronze Medal**: Solve under 5× target time
- Higher scores for faster solves and more complex circuits.

### Controls

- Click input nodes to toggle their values
- Use the MENU button to return to level select
- HINT button provides guidance (when available)

## Development

This game is built with vanilla JavaScript and HTML5 Canvas for rendering.

### Running Locally

1. Clone the repository
2. Open `index.html` in a modern web browser
3. No build process required — it's pure client-side code

### Project Structure

- `index.html`: Main HTML page
- `style.css`: Retro CRT styling
- `js/`: Game logic
  - `main.js`: Game loop and state management
  - `circuit.js`: Circuit simulation and logic
  - `renderer.js`: Canvas rendering
  - `levels.js`: Hand-crafted level definitions
  - `generator.js`: Procedural level generation
  - `input.js`: User input handling
  - `ui.js`: UI screens and transitions
  - `audio.js`: Sound effects
  - `scoring.js`: Score calculation and persistence
  - `constants.js`: Game constants and colors
- `tests/`: Test suite for circuit logic

### Testing

Run the test suite with:
```bash
node tests/run.js
```

Tests verify circuit simulation correctness and level solvability.

## License

[Add license if applicable]
