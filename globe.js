// Rotating network globe for the hero. Decorative: the page is complete without it.
// Land shape: Natural Earth 1:110m (public domain), reduced to a 180x90 bitmask.
(function () {
  'use strict';
  var canvas = document.getElementById('globe');
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext('2d');
  var MASK_W = 180, MASK_H = 90;
  var MASK = 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOh/gP8HAAAAAAAAAAAAAAAAAAAAAAD8/////w8AAAAGAAAHAAAAAAAAAABA7v/7//8fAPgDAAAA4AMAAAAAAAAA4Arvx////wEABgAACADwAwAAAAAAAAD40T8A/v8PAAAAABwA/n8AOAEAAAAA+LPvD8D//wAAAAAwIPz//wcDABDAAwD70/4P/P8HAAAcAIP//////x8AgP///3+/+4H/HwAA/B8A///////////w/////x9++B8AAOD/9///////////zf//////+QM/wAcA3////////////w/5/////zE88AEAAH7+////////////gP////8HeAAeAADw5////////////AHgBf7/f4AvAAAAAH78/////////8YAAAyA//8f+AcAAIDB4/////////8ADwAAAPD//9//AQAAPNz/////////A3gAAACA/v///T8AAGD3//////////8DAwAAAMD/////AwAA+P//////////PwAAAAAA+P///+cAAAD///////////8CAAAAAAD///8/DAAA4P//////////LwAAAAAA8P///wcAAAD+/+3z/////38CAAAAAAD///8HAAAA/tkPPP//////cQAAAAAA8P//fwAAAOBH///n/////wcBAAAAAAD///8BAAAAPkT7f/7///8zEAAAAAAA4P//DwAAAMD5Iv/n////f8YBAAAAAAD+//8AAAAA+A9A//////9jDwAAAAAAgP//AwAAAOD/Efj/////fxgAAAAAAADw/z8AAAAA/v////////8HAAAAAAAAAP8HAwAAAPD////7////fwAAAAAAAACgPyAAAACA//9/f/////8DAAAAAAAAAPQBAgAAAPz///9v////fwAAAAAAAAAAHjAAAADA/////g////8EAAAAAAAAAOBjGAAAAP7//9//4D//AwAAAAAAAQAAfIMOAADA/////Qf84RcAAAAAAAAAAAA/AAAAAPz//58/gAf+QAAAAAAAAAAAgA8AAADg////+wA4gB8EAAAAAAAAAADgAQAAAP7///8BgAP4wQAAAAAAAAAAAAhfAADA////7wAwgAwYAAAAAAAAAAAA/w8AAPj///8HAAcIgAEAAAAAAAAAAID/AQAA////fwBAAAEYAAAAAAAAAAAA+P8AAODz//8DAAA0OAAAAAAAAAAAAID/HwAAAPj/PwAAwMMBAAAAAAAAAAAA/P8BAADA//8AAAA43wQAAAAAAAAAAOD/fwAAAPz/BwAAAOOHAQAAAAAAAAAA/P8/AACA/z8AAABgbvQBAAAAAAAAAOD//w8AAPD/AwAAAAQMfAIAAAAAAAAA/P//AQAA/z8AAACAB4APAAAAAAAAAMD//w8AAPD/AwAAAAAWsEEAAAAAAAAA+P//AAAA/j8AAAAAAAAAAAAAAAAAAID//wcAAPD/RwAAAACAIwAAAAAAAAAA8P9/AAAA/z8GAAAAAD8GAAAAAAAAAAD8/wcAAPD/cwAAAAD4fwCAAAAAAAAAgP8/AAAA/w8HAAAAwP8PAAAAAAAAAAD4/wMAAOD/MAAAAAD//wEBAAAAAAAAgP8fAAAA/g8DAAAA+P8/AAAAAAAAAAD4PwAAAOB/MAAAAID//wMAAAAAAAAAwP8DAAAA/gcAAAAA+P9/AAAAAAAAAAD8PwAAAMA/AAAAAID//wcAAAAAAAAAwP8BAAAA+AEAAAAA+P9/AAAAAAAAAAD8DwAAAIAPAAAAAAAf/gMAAAAAAAAAwH8AAAAAAAAAAAAAMMA/AAAAAAAAAAD+AwAAAAAAAAAAAAAA8AEgAAAAAAAA4A8AAAAAAAAAAAAAAAACAAYAAAAAAAB+AAAAAAAAAAAAAAAAwAAwAAAAAAAA4AMAAAAAAAAAAAAAAAAIgAEAAAAAAAAeAAAAAAAAAAAAAAAAAAAMAAAAAAAA8AEAAAAAAAAAAAAAAAAAQAAAAAAAAAAfAAAAAAAAAAABAAAAAAAAAAAAAAAA8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOAAAAAAAAAAAAAAAAAAAAAAAAAAAAwAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMAAAAAAAD8APj///8HAAAAAAAAAAA0AAAAAADA/f/h/////x8AAAAAAAAA4AcAAMD/////z///////fwAAAAAA/Af+AADA//////////////8HAAD6/////wMAAP7/////////////HwCA//////8HAID///////////////8AAPP/////DwAO////////////////HwAA/v//////+Pz//////////////38AAOD/////////////////////////P/D/////////////////////////////////////////////////////////////////////////////////////////';
  var bits = (function () { var s = atob(MASK), a = new Uint8Array(s.length); for (var i = 0; i < s.length; i++) a[i] = s.charCodeAt(i); return a; })();
  function isLand(lat, lon) {
    var x = Math.floor((lon + 180) / 360 * MASK_W) % MASK_W, y = Math.min(MASK_H - 1, Math.floor((90 - lat) / 180 * MASK_H));
    var i = y * MASK_W + x; return (bits[i >> 3] >> (i & 7)) & 1;
  }
  var RAD = Math.PI / 180;
  function vec(lat, lon) { var a = lat * RAD, b = lon * RAD; return [Math.cos(a) * Math.sin(b), Math.sin(a), Math.cos(a) * Math.cos(b)]; }

  // Land dots on a Fibonacci sphere
  var dots = [], N = 5200, golden = Math.PI * (3 - Math.sqrt(5));
  for (var i = 0; i < N; i++) {
    var y = 1 - (i / (N - 1)) * 2, r = Math.sqrt(1 - y * y), th = golden * i;
    var lat = Math.asin(y) / RAD, lon = ((th / RAD) % 360 + 540) % 360 - 180;
    if (isLand(lat, lon)) dots.push([r * Math.sin(th), y, r * Math.cos(th)]);
  }

  // Nodes (lat, lon), spaced well apart. Node 0 is home. Each node joins its two nearest
  // neighbours, plus a few long-haul routes.
  var nodes = [[39.9, -75.35], [37.77, -122.42], [19.43, -99.13], [-23.55, -46.63], [64.15, -21.94], [51.5, -0.12],
               [30.04, 31.24], [6.52, 3.38], [-1.29, 36.82], [-33.92, 18.42], [55.75, 37.62], [19.08, 72.88],
               [1.35, 103.82], [35.68, 139.69], [-33.87, 151.21], [21.31, -157.86]].map(function (p) { return vec(p[0], p[1]); });
  function dot3(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
  var links = [], seen = {};
  function link(a, b) { var k = a < b ? a + '-' + b : b + '-' + a; if (a !== b && !seen[k]) { seen[k] = 1; links.push([a, b]); } }
  nodes.forEach(function (n, i) {
    nodes.map(function (m, j) { return [dot3(n, m), j]; }).sort(function (x, y) { return y[0] - x[0]; }).slice(1, 3).forEach(function (x) { link(i, x[1]); });
  });
  [[0, 5], [0, 3], [13, 15], [15, 1], [3, 9], [8, 11]].forEach(function (l) { link(l[0], l[1]); });
  function slerp(a, b, t) {
    var d = Math.max(-1, Math.min(1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2])), om = Math.acos(d), so = Math.sin(om) || 1;
    var k1 = Math.sin((1 - t) * om) / so, k2 = Math.sin(t * om) / so, lift = 1 + 0.07 * Math.sin(Math.PI * t) * (om / Math.PI + 0.35);
    return [(a[0] * k1 + b[0] * k2) * lift, (a[1] * k1 + b[1] * k2) * lift, (a[2] * k1 + b[2] * k2) * lift];
  }
  var SEG = 40;
  var arcs = links.map(function (l, n) {
    var pts = []; for (var s = 0; s <= SEG; s++) pts.push(slerp(nodes[l[0]], nodes[l[1]], s / SEG));
    return { pts: pts, phase: (n * 0.37) % 1, speed: 0.16 + (n % 5) * 0.035, flick: n * 1.7 };
  });

  var dark = false, size = 0, dpr = 1, yaw = -1.25, tilt = 0.36, colors = {};
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function readColors() {
    var cs = getComputedStyle(document.documentElement);
    dark = document.documentElement.getAttribute('data-theme') === 'dark';
    ['ink', 'muted', 'faint', 'line', 'accent', 'gold', 'paper', 'electric', 'electric-hot'].forEach(function (k) { colors[k] = cs.getPropertyValue('--' + k).trim(); });
  }
  function resize() {
    var w = canvas.clientWidth; if (!w) return;
    dpr = Math.min(window.devicePixelRatio || 1, 2); size = w;
    canvas.width = canvas.height = Math.round(w * dpr);
  }
  var cy_, sy_, ct, st;
  function proj(p) { // rotate about Y (yaw) then X (tilt); orthographic
    var x = p[0] * cy_ + p[2] * sy_, z = -p[0] * sy_ + p[2] * cy_, y = p[1] * ct - z * st; z = p[1] * st + z * ct;
    var R = size * 0.44; return [size / 2 + x * R, size / 2 - y * R, z];
  }
  function draw(time) {
    if (!size) return;
    cy_ = Math.cos(yaw); sy_ = Math.sin(yaw); ct = Math.cos(tilt); st = Math.sin(tilt);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, size, size);
    var R = size * 0.44, c = size / 2, i, p;
    ctx.beginPath(); ctx.arc(c, c, R, 0, 6.2832); ctx.strokeStyle = colors.line; ctx.lineWidth = 1; ctx.stroke();
    // land
    ctx.fillStyle = colors.muted;
    var dotR = Math.max(0.7, size / 520);
    for (i = 0; i < dots.length; i++) {
      p = proj(dots[i]); if (p[2] <= 0) continue;
      ctx.globalAlpha = 0.3 + 0.6 * p[2];
      ctx.fillRect(p[0] - dotR, p[1] - dotR, dotR * 2, dotR * 2);
    }
    // links: a soft wide stroke under a thin bright one reads as a glow
    var E = colors.electric, HOT = colors['electric-hot'];
    ctx.lineCap = 'round';
    if (dark) ctx.globalCompositeOperation = 'lighter';
    arcs.forEach(function (a) {
      var prev = null, path = [], s, q, vis;
      ctx.beginPath();
      for (s = 0; s <= SEG; s++) {
        q = proj(a.pts[s]); vis = q[2] > 0 || Math.hypot(q[0] - c, q[1] - c) > R; path.push(vis ? q : null);
        if (vis) { if (prev) ctx.lineTo(q[0], q[1]); else ctx.moveTo(q[0], q[1]); prev = q; } else prev = null;
      }
      var flick = reduce ? 0.8 : 0.62 + 0.22 * Math.sin(time * 5.3 + a.flick) + 0.16 * Math.sin(time * 17.1 + a.flick * 2.3);
      ctx.strokeStyle = E;
      ctx.globalAlpha = 0.1 * flick; ctx.lineWidth = Math.max(3, size / 120); ctx.stroke();
      ctx.globalAlpha = 0.85 * flick; ctx.lineWidth = Math.max(0.9, size / 480); ctx.stroke();
      // a bright pulse with a short tail running along the link
      var t = (a.phase + time * a.speed) % 1, head = t * SEG, TAIL = 7;
      for (s = 0; s < TAIL; s++) {
        var f = head - s * 0.8; if (f < 0) break;
        var k = Math.floor(f), u = f - k, A = path[k], B = path[Math.min(SEG, k + 1)];
        if (!A || !B) continue;
        var x = A[0] + (B[0] - A[0]) * u, y = A[1] + (B[1] - A[1]) * u, w = 1 - s / TAIL;
        ctx.globalAlpha = w * w; ctx.fillStyle = s === 0 ? HOT : E;
        if (s === 0) { ctx.globalAlpha = 0.28; ctx.fillStyle = E; ctx.beginPath(); ctx.arc(x, y, Math.max(4, size / 70), 0, 6.2832); ctx.fill(); ctx.globalAlpha = 1; ctx.fillStyle = HOT; }
        ctx.beginPath(); ctx.arc(x, y, Math.max(1.1, size / 300) * (0.5 + w * 0.8), 0, 6.2832); ctx.fill();
      }
    });
    ctx.globalCompositeOperation = 'source-over';
    // nodes
    for (i = 0; i < nodes.length; i++) {
      p = proj(nodes[i]); if (p[2] <= 0) continue;
      var nr = (i === 0 ? 3.6 : 2.1) * Math.max(1, size / 460);
      var tw = reduce ? 1 : 0.75 + 0.25 * Math.sin(time * 3 + i * 1.9);
      ctx.globalAlpha = 0.22 * tw; ctx.fillStyle = E; ctx.beginPath(); ctx.arc(p[0], p[1], nr * 3.2, 0, 6.2832); ctx.fill();
      ctx.globalAlpha = 0.4 * tw; ctx.beginPath(); ctx.arc(p[0], p[1], nr * 1.8, 0, 6.2832); ctx.fill();
      ctx.globalAlpha = 1;
      ctx.fillStyle = i === 0 ? colors.accent : (dark ? '#ffffff' : E); ctx.beginPath(); ctx.arc(p[0], p[1], nr, 0, 6.2832); ctx.fill();
      if (i === 0 && !reduce) {
        var pulse = (time * 0.6) % 1; ctx.globalAlpha = 0.6 * (1 - pulse); ctx.strokeStyle = colors.accent; ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.arc(p[0], p[1], nr + pulse * 16, 0, 6.2832); ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
  }

  var running = false, visible = true, last = 0, clock = 0, dragging = false, lastX = 0, raf = 0;
  function frame(now) {
    raf = 0; if (!running) return;
    var dt = Math.min(0.05, (now - (last || now)) / 1000); last = now; clock += dt;
    if (!dragging) yaw += dt * 0.11;
    draw(clock); raf = requestAnimationFrame(frame);
  }
  function setRunning(on) {
    on = on && !reduce && visible && !document.hidden;
    if (on === running) return; running = on; last = 0;
    if (on && !raf) raf = requestAnimationFrame(frame);
  }
  readColors(); resize(); draw(0);
  window.addEventListener('resize', function () { resize(); draw(clock); });
  new MutationObserver(function () { readColors(); draw(clock); }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (e) { visible = e[0].isIntersecting; setRunning(true); }).observe(canvas);
  }
  document.addEventListener('visibilitychange', function () { setRunning(true); });
  // Drag to spin
  canvas.addEventListener('pointerdown', function (e) { dragging = true; lastX = e.clientX; canvas.setPointerCapture(e.pointerId); });
  canvas.addEventListener('pointermove', function (e) { if (!dragging) return; yaw += (e.clientX - lastX) * 0.008; lastX = e.clientX; if (!running) draw(clock); });
  ['pointerup', 'pointercancel'].forEach(function (n) { canvas.addEventListener(n, function () { dragging = false; }); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { resize(); draw(clock); });
  setRunning(true);
})();
