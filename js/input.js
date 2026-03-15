import { NODE_TYPE, NODE_RADIUS } from './constants.js';
import { toggleInput } from './circuit.js';

export function initInput(canvas, getCircuit, onToggle) {
  function getCanvasPos(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    let cx, cy;
    if (e.touches) {
      cx = (e.touches[0].clientX - rect.left) * scaleX;
      cy = (e.touches[0].clientY - rect.top) * scaleY;
    } else {
      cx = (e.clientX - rect.left) * scaleX;
      cy = (e.clientY - rect.top) * scaleY;
    }
    return { x: cx, y: cy };
  }

  function hitTest(pos, circuit) {
    for (const id of circuit.inputIds) {
      const node = circuit.nodes[id];
      const dx = pos.x - node.x;
      const dy = pos.y - node.y;
      if (dx * dx + dy * dy <= NODE_RADIUS * NODE_RADIUS * 1.5) {
        return id;
      }
    }
    return null;
  }

  function handleClick(e) {
    e.preventDefault();
    const circuit = getCircuit();
    if (!circuit) return;
    const pos = getCanvasPos(e);
    const id = hitTest(pos, circuit);
    if (id) {
      toggleInput(circuit, id);
      onToggle(id);
    }
  }

  canvas.addEventListener('click', handleClick);
  canvas.addEventListener('touchend', handleClick, { passive: false });

  return () => {
    canvas.removeEventListener('click', handleClick);
    canvas.removeEventListener('touchend', handleClick);
  };
}
