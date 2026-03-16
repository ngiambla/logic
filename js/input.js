import { NODE_TYPE, NODE_RADIUS } from './constants.js';
import { toggleInput } from './circuit.js';

export function initInput(canvas, getCircuit, onToggle) {
  let usedTouch = false;

  function getCanvasPos(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    let cx, cy;
    const touch = e.changedTouches ? e.changedTouches[0] : null;
    if (touch) {
      cx = (touch.clientX - rect.left) * scaleX;
      cy = (touch.clientY - rect.top) * scaleY;
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
      // Larger hit area on touch devices
      const mult = usedTouch ? 2.5 : 1.5;
      if (dx * dx + dy * dy <= NODE_RADIUS * NODE_RADIUS * mult) {
        return id;
      }
    }
    return null;
  }

  function handleInteraction(e) {
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

  function handleTouchStart(e) {
    // Prevent scrolling/zooming when touching the canvas
    e.preventDefault();
  }

  function handleTouchEnd(e) {
    usedTouch = true;
    handleInteraction(e);
  }

  function handleClick(e) {
    // Skip synthetic click events that follow touch events
    if (usedTouch) return;
    handleInteraction(e);
  }

  canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
  canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
  canvas.addEventListener('click', handleClick);

  return () => {
    canvas.removeEventListener('touchstart', handleTouchStart);
    canvas.removeEventListener('touchend', handleTouchEnd);
    canvas.removeEventListener('click', handleClick);
  };
}
