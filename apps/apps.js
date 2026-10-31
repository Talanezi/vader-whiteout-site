import './figures/scheduler.js';
import './figures/production-desk.js';
import './figures/equipment.js';

/* The links own input; SVG never intercepts navigation. Relay mouse/focus to
   Hairline's fixed figure plane, preserving the complete link footprint. */
const motion = matchMedia('(prefers-reduced-motion: reduce)');
const mounts = [];
for (const host of document.querySelectorAll('[data-figure]')) {
  const figure = window.whiteoutFigures?.get(host.dataset.figure);
  if (!figure || !window.HL) continue;
  const fallback = host.firstElementChild?.cloneNode(true);
  let svg, handle;
  try {
    svg = HL.mk('svg', { viewBox: '0 0 400 320', 'aria-hidden': 'true' });
    host.replaceChildren(svg);
    handle = figure.mount({ stage: host, svg, read: { textContent: '' } }, figure.range[1]);
  } catch (error) {
    handle?.destroy();
    if (fallback) host.replaceChildren(fallback);
    console.warn(`Whiteout illustration unavailable: ${figure.name}`, error);
    continue;
  }
  const link = host.closest('a');
  const leave = () => host.dispatchEvent(new PointerEvent('pointerleave', { pointerType: 'mouse' }));
  function respond(event) {
    if (motion.matches || event.pointerType === 'touch') return;
    const bounds = host.getBoundingClientRect();
    host.dispatchEvent(new PointerEvent('pointermove', {
      pointerType: 'mouse',
      clientX: Math.max(bounds.left, Math.min(bounds.right, event.clientX)),
      clientY: Math.max(bounds.top, Math.min(bounds.bottom, event.clientY)),
    }));
  }
  function focus() {
    if (!link.matches(':focus-visible')) return;
    const bounds = host.getBoundingClientRect();
    respond({ clientX: bounds.left + bounds.width * .58, clientY: bounds.top + bounds.height * .48 });
  }
  link.addEventListener('pointermove', respond, { passive: true });
  link.addEventListener('pointerleave', leave, { passive: true });
  link.addEventListener('focus', focus);
  link.addEventListener('blur', leave);
  motion.addEventListener('change', leave);
  mounts.push(() => {
    link.removeEventListener('pointermove', respond);
    link.removeEventListener('pointerleave', leave);
    link.removeEventListener('focus', focus);
    link.removeEventListener('blur', leave);
    motion.removeEventListener('change', leave);
    handle.destroy();
  });
}
// Keep the page intact in the back-forward cache; destroy on actual unload.
window.addEventListener('pagehide', event => { if (!event.persisted) mounts.forEach(dispose => dispose()); });
