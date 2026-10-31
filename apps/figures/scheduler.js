/* Original Whiteout figure. Hairline Terrain's fixed field and spring falloff. */
const { Cam, fit, proj, facing, rings, rrect, prism, poly, hull, seg,
  solid, put, mk, spring, stepS, register, pointer, disposer, clamp } = HL;

function mount({ stage, svg, read }, value) {
  const bag = disposer(), C = Cam(45, .5, 1.9);
  const ext = [];
  for (const x of [-12, 130]) for (const y of [10, 68]) ext.push([x * 1.25, y, 0]);
  for (const x of [-4, 123]) for (const z of [23, 140]) for (const d of [-8, 11]) ext.push([x * 1.25, 25 + z * .1 + d, z * .72]);
  fit(C, ext, 200, 163);
  const project = proj(C), P = (x, y, z) => project(x * 1.25, y, z * .72);
  const front = facing(C), g = mk('g', {}, svg);
  let reach = value, over = null;
  const base = rings(-12, 10, 130, 68, 5, 1.5);
  put(solid(g), prism(P, front, ...base, 0, 5));
  for (const x of [12, 100]) {
    const foot = rings(x, 29, x + 9, 48, 2, .7);
    put(solid(g), prism(P, front, ...foot, 5, 27));
  }
  const plane = (x, z, depth = 0) => P(x, 25 + z * .1 + depth, z);
  const outline = rrect(-4, 23, 123, 140, 4, 6);
  const at = (r, d) => r.map(q => plane(q.u, q.v, d));
  // Back sheet, solid frame, then the inset grid: no far edges show through.
  mk('path', { d: poly(at(outline, -8)), class: 'lo' }, g);
  mk('path', { d: poly(hull(at(outline, -4).concat(at(outline, 0)))), class: 'sil' }, g);
  mk('path', { d: poly(at(rrect(0, 27, 119, 136, 2.5, 6), 0)), class: 'lo' }, g);
  let marks = seg(plane(0, 123), plane(119, 123));
  for (let i = 0; i < 5; i++) marks += seg(plane(8 + i * 23, 130), plane(20 + i * 23, 130));
  mk('path', { d: marks, class: 'nf' }, g);
  const cells = [];
  for (let r = 5; r >= 0; r--) for (let c = 0; c < 5; c++) {
    const x = 4 + c * 23, z = 30 + r * 15;
    const ring = rrect(x, z, x + 19, z + 12, 1.2, 4);
    const available = (c === 1 && r >= 1 && r <= 3) || (c === 2 && r >= 2 && r <= 4) || (c === 3 && r >= 2 && r <= 3);
    const rest = available ? 1.8 : .1;
    const el = mk('path', { class: available ? 'sil' : 'lo' }, g);
    cells.push({ c, r, ring, available, rest, sp: spring(rest), el,
      center: plane(x + 9.5, z + 6), drawn: NaN });
  }
  // One connected common time range is the starting point for the eye.
  function draw(cell) {
    if (cell.drawn === cell.sp.x) return;
    cell.drawn = cell.sp.x;
    const v = clamp(cell.sp.x, 0, 11);
    cell.el.setAttribute('d', poly(at(cell.ring, v)));
  }
  function target() {
    let chosen = null, closest = Infinity;
    for (const cell of cells) {
      const d = over ? Math.hypot(cell.center[0] - over[0], cell.center[1] - over[1]) : Infinity;
      if (d < closest) { chosen = cell; closest = d; }
    }
    for (const cell of cells) {
      const distance = chosen ? Math.hypot((cell.c - chosen.c) * .8, cell.r - chosen.r) : Infinity;
      const aligned = chosen && cell.r === chosen.r;
      cell.sp.t = chosen ? cell.rest + 8 * Math.max(0, 1 - distance / reach) + (aligned ? 1 : 0) : cell.rest;
      cell.el.setAttribute('class', (chosen ? aligned && Math.abs(cell.c - chosen.c) <= 1 : cell.r === 2 && cell.c >= 1 && cell.c <= 3) ? 'hi' : cell.available ? 'sil' : 'lo');
    }
    read.textContent = chosen ? `range ${chosen.r + 1}` : 'rest';
    B.wake();
  }
  const B = register(stage, dt => {
    let moving = false;
    for (const cell of cells) { if (stepS(cell.sp, dt)) moving = true; draw(cell); }
    return moving;
  });
  bag.add(B.unregister);
  bag.add(pointer(stage, { move: p => { over = p; target(); }, leave: () => { over = null; target(); } }));
  bag.add(() => svg.replaceChildren());
  cells.forEach(draw); target();
  return { set: v => { reach = v; target(); }, destroy: bag.dispose };
}

hairline({
  name: 'scheduler',
  means: 'A standing availability instrument brings neighbouring time ranges into alignment.',
  rules: [1, 3, 5, 6, 7, 8, 9], range: [1.2, 2.4, 3.5],
  tour: [[172, 147], [227, 175], [260, 153], null], mount,
});
