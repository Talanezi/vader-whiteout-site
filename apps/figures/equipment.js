/* Original filmmaking case. Hinged reveal follows Drawer/Cabinet principles. */
const { Cam, fit, proj, facing, rings, rrect, circ, ringAt, prism, poly, open, run, hull, seg,
  solid, put, mk, spring, stepS, register, pointer, disposer, clamp, rad } = HL;

function mount({ stage, svg, read }, value) {
  const bag = disposer(), C = Cam(45, .5, 1.65);
  const ext = [];
  for (const x of [0, 132]) for (const y of [0, 87]) ext.push([x, y, 0]);
  for (const x of [0, 132]) for (const a of [100, 122]) ext.push([x, 82 * Math.cos(rad(a)) - 3, 30 + 82 * Math.sin(rad(a))]);
  fit(C, ext, 200, 157);
  const P = proj(C), front = facing(C), g = mk('g', {}, svg);
  let opening = value, over = null;
  const hinge = spring(100), gearLift = spring(0);
  const lid = solid(g), lining = mk('path', { class: 'nf lo' }, g);
  const lidRibs = mk('path', { class: 'nf lo' }, g);
  // The lid is always behind the body and contents, hinged along y = 0.
  const body = rings(0, 0, 132, 85, 6, 2.2);
  put(solid(g), prism(P, front, ...body, 0, 29));
  const well = rrect(5, 5, 127, 80, 4, 6);
  mk('path', { d: poly(ringAt(P, well, 29)), class: 'sil' }, g);
  const compartments = [[10, 10, 74, 74], [80, 10, 122, 40], [80, 45, 122, 74]];
  for (const box of compartments) {
    mk('path', { d: poly(ringAt(P, rrect(...box, 2.4, 5), 27)), class: 'lo' }, g);
    mk('path', { d: poly(ringAt(P, rrect(box[0] + 2, box[1] + 2, box[2] - 2, box[3] - 2, 1.8, 5), 24)), class: 'lo' }, g);
  }
  // Camera body, shoulder, handle and a cylindrical lens on the front face.
  const camera = mk('g', {}, g), chassis = solid(camera), shoulder = solid(camera), handle = solid(camera);
  const cameraMarks = mk('path', { class: 'nf lo' }, camera);
  const barrel = solid(camera), glass = mk('path', { class: 'nf hi' }, camera);
  const lensGear = [];
  for (const y of [25, 59]) {
    const el = solid(g), cap = mk('path', { class: 'nf' }, el.g);
    lensGear.push({ y, el, cap });
  }
  // Front wall hides the deep contents; hardware is attached to this wall.
  const wall = (x0, y0, x1, y1, z0, z1, radius = 1) => prism(P, front, ...rings(x0, y0, x1, y1, radius, .5), z0, z1);
  put(solid(g), wall(0, 80, 132, 85, 1, 29, 2));
  put(solid(g), wall(127, 0, 132, 80, 1, 29, 2));
  for (const x of [5, 116]) put(solid(g), wall(x, 79, x + 11, 87, 1, 10, 1.5));
  const hardware = mk('path', { class: 'nf sil' }, g);
  const onFront = ring => poly(ring.map(q => P(q.u, 86, q.v)));
  hardware.setAttribute('d', [21, 101].map(x => onFront(rrect(x, 19, x + 9, 33, 1.5, 4))).join('')
    + onFront(rrect(49, 9, 83, 20, 3, 5)) + onFront(rrect(53, 11, 79, 17, 2, 5)));
  mk('path', { d: [21, 101].map(x => seg(P(x + 2, 86, 24), P(x + 7, 86, 24))).join(''), class: 'nf lo' }, g);
  const hinges = mk('path', { class: 'nf' }, g);
  hinges.setAttribute('d', [21, 100].map(x => seg(P(x, 0, 30), P(x + 12, 0, 30))).join(''));
  let drawnAngle = NaN, drawnGear = NaN;
  function drawLid() {
    const a = clamp(hinge.x, 100, 122);
    if (a === drawnAngle) return;
    drawnAngle = a;
    const at = (ring, d) => ring.map(q => P(q.u, q.v * Math.cos(rad(a)) + d, 30 + q.v * Math.sin(rad(a))));
    const rim = rrect(0, 0, 132, 82, 5, 6);
    put(lid, { sil: poly(hull(at(rim, -3).concat(at(rim, 0)))), crease: poly(at(rrect(3, 3, 129, 79, 3, 6), 0)) });
    lining.setAttribute('d', poly(at(rrect(8, 8, 124, 74, 3, 6), .2)));
    let ribs = '';
    for (let x = 19; x < 120; x += 14) ribs += seg(...[12, 69].map(v => P(x, v * Math.cos(rad(a)) + .3, 30 + v * Math.sin(rad(a)))));
    lidRibs.setAttribute('d', ribs);
  }
  function drawGear() {
    const lift = clamp(gearLift.x, 0, 6);
    if (lift === drawnGear) return;
    drawnGear = lift;
    put(chassis, wall(20, 24, 62, 50, 20 + lift, 39 + lift, 2));
    put(shoulder, wall(28, 27, 52, 44, 39 + lift, 46 + lift, 1.5));
    put(handle, wall(23, 28, 57, 32, 46 + lift, 50 + lift, 1));
    cameraMarks.setAttribute('d', seg(P(27, 24, 28 + lift), P(43, 24, 28 + lift)));
    const circle = (radius, y) => circ(radius, 48).map(q => P(41 + q.u, y, 28 + lift + q.v));
    put(barrel, { sil: poly(hull(circle(12, 48).concat(circle(12, 69)))), crease: poly(circle(11, 65)) });
    glass.setAttribute('d', poly(circle(8, 69.2)) + poly(circle(4.6, 69.3)));
    lensGear.forEach((L, i) => {
      const up = lift * (i === 0 ? .55 : .3), z = 24 + up, height = i === 0 ? 23 : 16;
      const ring = circ(11, 48).map(q => ({ ...q, u: q.u + 101, v: q.v + L.y }));
      const inner = circ(9.5, 48).map(q => ({ ...q, u: q.u + 101, v: q.v + L.y }));
      put(L.el, prism(P, front, ring, inner, z, z + height));
      const optic = circ(6, 48).map(q => ({ ...q, u: q.u + 101, v: q.v + L.y }));
      L.cap.setAttribute('d', poly(ringAt(P, inner, z + height)) + poly(ringAt(P, optic, z + height))
        + open(ringAt(P, run(ring, front), z + height * .36)) + open(ringAt(P, run(ring, front), z + height * .54)));
    });
  }
  const B = register(stage, dt => {
    let moving = stepS(hinge, dt);
    if (stepS(gearLift, dt)) moving = true;
    drawLid(); drawGear(); return moving;
  });
  bag.add(B.unregister);
  function target() {
    const strength = over ? .4 + .6 * clamp(1 - over[1] / 320, 0, 1) : 0;
    hinge.t = 100 + opening * strength;
    gearLift.t = over ? 3 + 2 * clamp(over[0] / 400, 0, 1) : 0;
    lid.sil.classList.toggle('hi', !!over);
    glass.setAttribute('class', over ? 'nf sil' : 'nf hi');
    read.textContent = over ? 'case open' : 'rest'; B.wake();
  }
  bag.add(pointer(stage, { move: p => { over = p; target(); }, leave: () => { over = null; target(); } }));
  bag.add(() => svg.replaceChildren());
  drawLid(); drawGear(); target();
  return { set: v => { opening = v; target(); }, destroy: bag.dispose };
}

hairline({
  name: 'equipment', means: 'A hinged hard case opens to reveal a cinema camera and fitted lens compartments.',
  rules: [1, 3, 5, 6, 7, 8, 9, 10], range: [10, 18, 22],
  tour: [[190, 100], [255, 185], [165, 208], null], mount,
});
