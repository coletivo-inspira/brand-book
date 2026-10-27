/*
 * Trilha de conexões em verde menta que segue o cursor pela grade pontilhada do body.
 * Mesma lógica do componente DotTrail do portal inspira.dev.br.
 */
(function () {
  /* Must match the dotted `background-size` on `body`. */
  var GRID = 22;
  /* radial-gradient dots sit at the centre of each tile. */
  var GRID_OFFSET = GRID / 2;
  var LIFETIME_MS = 700;
  var NODE_SIZE = 8;
  var BAR_WIDTH = 3;
  var MAX_SEGMENTS = 40;
  /* Jumps longer than this (in grid cells) start a new trail instead of drawing a long bar. */
  var MAX_LINK_CELLS = 12;
  var COLOR = "#A3E5C2";
  var DISABLED_QUERY = "(prefers-reduced-motion: reduce), (hover: none), (pointer: coarse)";

  if (typeof window.matchMedia !== "function") return;

  var canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  canvas.style.cssText =
    "position:fixed;inset:0;z-index:60;width:100%;height:100%;pointer-events:none;mix-blend-mode:multiply;";
  var ctx = canvas.getContext("2d");
  if (!ctx) return;
  document.body.appendChild(canvas);

  var disabledQuery = window.matchMedia(DISABLED_QUERY);
  var segments = [];
  var last = null;
  var pointer = null;
  var frame = 0;
  var listening = false;

  function snapToDots(x, y) {
    return {
      x: Math.round((x - GRID_OFFSET) / GRID) * GRID + GRID_OFFSET,
      y: Math.round((y - GRID_OFFSET) / GRID) * GRID + GRID_OFFSET,
    };
  }

  /* Grid points walked from `a` to `b` (excluding `a`), horizontal first, then vertical. */
  function connectPoints(a, b) {
    var path = [];
    var dx = Math.sign(b.x - a.x) * GRID;
    var dy = Math.sign(b.y - a.y) * GRID;
    var x = a.x;
    var y = a.y;
    while (dx !== 0 && x !== b.x) {
      x += dx;
      path.push({ x: x, y: y });
    }
    while (dy !== 0 && y !== b.y) {
      y += dy;
      path.push({ x: x, y: y });
    }
    return path;
  }

  function segmentAlpha(age) {
    if (age <= 0) return 1;
    if (age >= LIFETIME_MS) return 0;
    var t = age / LIFETIME_MS;
    return 1 - t * t;
  }

  function resize() {
    var dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(window.innerWidth * dpr);
    canvas.height = Math.round(window.innerHeight * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function draw(now) {
    segments = segments.filter(function (segment) {
      return now - segment.born < LIFETIME_MS;
    });
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    ctx.fillStyle = COLOR;
    ctx.strokeStyle = COLOR;
    ctx.lineCap = "square";

    var offsetX = window.scrollX;
    var offsetY = window.scrollY;

    segments.forEach(function (segment) {
      var alpha = segmentAlpha(now - segment.born);
      var scale = 0.35 + 0.65 * alpha;
      var x = segment.point.x - offsetX;
      var y = segment.point.y - offsetY;
      ctx.globalAlpha = alpha;

      if (segment.from) {
        ctx.lineWidth = BAR_WIDTH * scale;
        ctx.beginPath();
        ctx.moveTo(segment.from.x - offsetX, segment.from.y - offsetY);
        ctx.lineTo(x, y);
        ctx.stroke();
      }

      var size = NODE_SIZE * scale;
      ctx.fillRect(x - size / 2, y - size / 2, size, size);
    });

    ctx.globalAlpha = 1;
    frame = segments.length > 0 ? requestAnimationFrame(draw) : 0;
  }

  function trackPointer() {
    if (!pointer) return;
    var next = snapToDots(pointer.x + window.scrollX, pointer.y + window.scrollY);
    if (last && last.x === next.x && last.y === next.y) return;

    var now = performance.now();
    var cells = last ? Math.max(Math.abs(next.x - last.x), Math.abs(next.y - last.y)) / GRID : 0;

    if (!last || cells > MAX_LINK_CELLS) {
      segments.push({ point: next, from: null, born: now });
    } else {
      var previous = last;
      connectPoints(last, next).forEach(function (point) {
        segments.push({ point: point, from: previous, born: now });
        previous = point;
      });
    }

    if (segments.length > MAX_SEGMENTS) segments = segments.slice(-MAX_SEGMENTS);
    last = next;
    if (!frame) frame = requestAnimationFrame(draw);
  }

  function onPointerMove(event) {
    if (event.pointerType && event.pointerType !== "mouse") return;
    pointer = { x: event.clientX, y: event.clientY };
    trackPointer();
  }

  function onPointerLeave() {
    pointer = null;
    last = null;
  }

  function start() {
    if (listening) return;
    listening = true;
    resize();
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("scroll", trackPointer, { passive: true });
    window.addEventListener("resize", resize);
    document.documentElement.addEventListener("pointerleave", onPointerLeave);
  }

  function stop() {
    if (!listening) return;
    listening = false;
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("scroll", trackPointer);
    window.removeEventListener("resize", resize);
    document.documentElement.removeEventListener("pointerleave", onPointerLeave);
    cancelAnimationFrame(frame);
    frame = 0;
    segments = [];
    last = null;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  function sync() {
    if (disabledQuery.matches) stop();
    else start();
  }

  sync();
  if (disabledQuery.addEventListener) disabledQuery.addEventListener("change", sync);
})();
