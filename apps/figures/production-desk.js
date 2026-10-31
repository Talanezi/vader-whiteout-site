/* Original call sheets: Exploded's spring gap with Stack/Riffle's stagger. */
const { Cam, fit, proj, facing, rings, rrect, ringAt, prism, poly, seg,
  solid, put, mk, spring, stepS, tween, tset, tval, tdone,
  register, pointer, disposer, clamp } = HL;

function mount({ stage, svg, read }, value) {
  const bag = disposer(), C = Cam(45, .5, 1.88);
  const ext = [];
  for (const x of [-7, 106]) for (const y of [-7, 139]) ext.push([x, y, 0]);
  for (const x of [-1, 100]) for (const y of [-5, 131]) ext.push([x, y, 74]);
  fit(C, ext, 200, 166);
  const P = proj(C), front = facing(C), g = mk('g', {}, svg);
  let lift = value, active = false;
  const spread = spring(.7), base = rings(-7, -7, 106, 139, 5, 1.7);
  put(solid(g), prism(P, front, ...base, 0, 5));
  const layers = [];
  for (let i = 0; i < 4; i++) {
    const x = [0, 3, -1, 1][i], y = [0, -2, 2, 0][i];
    const ring = rings(x, y, x + 97, y + 129, 1.8, .6);
    const guide = mk('path', { class: 'dash' }, g), el = solid(g);
    const fields = mk('path', { class: 'nf' }, el.g);
    const details = mk('path', { class: 'nf lo' }, el.g);
    const title = mk('path', { class: 'nf sil' }, el.g);
    const clip = i === 3 ? solid(el.g) : null;
    const clipInset = i === 3 ? mk('path', { class: 'nf' }, el.g) : null;
    layers.push({ i, x, y, ring, guide, el, fields, details, title, clip, clipInset, tw: tween(0), drawn: NaN });
  }
  function draw(L, offset) {
    if (offset === L.drawn) return;
    L.drawn = offset;
    const z = 7 + L.i * 4.4 + offset, top = z + 1.2;
    const Q = (x, y) => P(x + L.x, y + L.y, top);
    put(L.el, prism(P, front, ...L.ring, z, top));
    let lines = seg(Q(7, 25), Q(90, 25)) + seg(Q(7, 43), Q(90, 43));
    lines += seg(Q(35, 27), Q(35, 41)) + seg(Q(66, 27), Q(66, 41));
    for (const y of [50, 61, 72, 83, 94, 105]) lines += seg(Q(7, y), Q(90, y));
    lines += seg(Q(24, 50), Q(24, 105)) + seg(Q(68, 50), Q(68, 105));
    L.fields.setAttribute('d', lines);
    let details = '';
    for (let r = 0; r < 5; r++) {
      const y = 55 + r * 11;
      details += seg(Q(10, y), Q(18, y)) + seg(Q(29, y), Q(52 + r % 3 * 4, y)) + seg(Q(73, y), Q(84, y));
    }
    for (const x of [7, 40, 72]) details += seg(Q(x, 32), Q(x + 12, 32)) + seg(Q(x, 36), Q(x + 17, 36));
    details += seg(Q(7, 114), Q(42, 114)) + seg(Q(57, 114), Q(90, 114)) + seg(Q(7, 119), Q(27, 119));
    L.details.setAttribute('d', details);
    L.title.setAttribute('d', seg(Q(7, 16), Q(49, 16)) + seg(Q(7, 20), Q(36, 20)) + poly([Q(73, 10), Q(90, 10), Q(90, 20), Q(73, 20)]));
    if (L.i > 0) L.guide.setAttribute('d', [0, 97].map(x => seg(P(x, 129, z), P(x, 129, 7 + (L.i - 1) * 4.4))).join(''));
    if (L.clip) {
      const clipRing = rings(35, -3, 62, 9, 2, .8);
      put(L.clip, prism(P, front, ...clipRing, top + .2, top + 2.4));
      L.clipInset.setAttribute('d', poly(ringAt(P, rrect(42, -5, 55, 3, 2, 5), top + 2.5)));
    }
  }
  const B = register(stage, (dt, now) => {
    let moving = stepS(spread, dt);
    for (const L of layers) {
      const amount = tval(L.tw, now) * spread.x;
      draw(L, amount);
      if (!tdone(L.tw, now)) moving = true;
    }
    return moving;
  });
  bag.add(B.unregister);
  function choose(on, p) {
    spread.t = p ? .65 + .35 * clamp(p[0] / 400, 0, 1) : .7;
    if (on !== active) {
      active = on;
      const now = performance.now();
      layers.forEach(L => tset(L.tw, on ? (L.i + 1) * lift : 0, now, Math.abs(3 - L.i) * 45));
    }
    layers.forEach(L => L.el.sil.classList.toggle('hi', L.i === 3));
    read.textContent = on ? 'sheets 4' : 'rest';
    B.wake();
  }
  bag.add(pointer(stage, { move: p => choose(true, p), leave: () => choose(false, null) }));
  bag.add(() => svg.replaceChildren());
  layers.forEach(L => draw(L, 0)); choose(false, null);
  return { set: v => { lift = v; const on = active; active = !on; choose(on, null); }, destroy: bag.dispose };
}

hairline({
  name: 'production-desk',
  means: 'Four clipped call sheets separate into an ordered assembly above their production board.',
  rules: [1, 2, 3, 5, 6, 7, 8, 9, 10], range: [5, 9, 13],
  tour: [[150, 174], [275, 158], [210, 220], null], mount,
});
