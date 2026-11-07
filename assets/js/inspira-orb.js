/*
 * Orb +INSPIRA — selo flutuante em liquid glass para sites/subdomínios do Coletivo.
 * Mesma lógica do componente InspiraOrb do portal inspira.dev.br.
 *
 * Uso (qualquer página):
 *   <script
 *     src="https://coletivo-inspira.github.io/brand-book/assets/js/inspira-orb.js"
 *     data-href="https://inspira.dev.br/"
 *     defer
 *   ></script>
 *
 * Atributos opcionais no <script>:
 *   data-href     — destino do clique (default https://inspira.dev.br/)
 *   data-label    — aria-label (default em PT)
 *   data-hide-on  — hostnames CSV onde a orb não monta
 */
(function () {
  "use strict";

  var DEFAULT_HREF = "https://inspira.dev.br/";
  var DEFAULT_LABEL = "Coletivo Inspira — ir ao site oficial";
  var ROOT_CLASS = "inspira-orb";
  var STYLE_ID = "inspira-orb-styles";
  var REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
  var TAU = Math.PI * 2;
  var CYCLE_MS = 14000;
  var SEGMENTS = 72;
  var BASE_RADIUS = 22;
  /* Distance (px) from the orb edge where it starts leaning toward the cursor. */
  var PROXIMITY_RANGE = 140;
  var FOREST = "19, 56, 36";
  var PALETTE = [
    { r: 186, g: 255, b: 41 },
    { r: 163, g: 229, b: 194 },
    { r: 240, g: 93, b: 35 },
  ];

  if (document.querySelector("a." + ROOT_CLASS)) return;

  var script =
    document.currentScript ||
    (function () {
      var nodes = document.getElementsByTagName("script");
      for (var i = nodes.length - 1; i >= 0; i--) {
        if ((nodes[i].src || "").indexOf("inspira-orb") !== -1) return nodes[i];
      }
      return null;
    })();

  var href = (script && script.getAttribute("data-href")) || DEFAULT_HREF;
  var label = (script && script.getAttribute("data-label")) || DEFAULT_LABEL;
  var hideOn = ((script && script.getAttribute("data-hide-on")) || "")
    .split(",")
    .map(function (host) {
      return host.trim().toLowerCase();
    })
    .filter(Boolean);

  if (hideOn.length && hideOn.indexOf((location.hostname || "").toLowerCase()) !== -1) {
    return;
  }

  var A = "a." + ROOT_CLASS;
  var css = [
    A + "{--orb-size:4rem;--orb-bleed:1.25rem;position:fixed;left:0.9rem;bottom:0.9rem;z-index:70;" +
      "width:var(--orb-size);height:var(--orb-size);display:grid;place-items:center;border-radius:50%;" +
      "text-decoration:none;outline:none;-webkit-tap-highlight-color:transparent;}",
    A + ":focus-visible{box-shadow:0 0 0 2px #133824,0 0 0 4px #BAFF29;}",
    A + " canvas{position:absolute;inset:calc(var(--orb-bleed) * -1);width:calc(100% + var(--orb-bleed) * 2);" +
      "height:calc(100% + var(--orb-bleed) * 2);pointer-events:none;}",
    A + " .inspira-orb__plus{position:relative;z-index:1;width:1.3rem;height:1.3rem;pointer-events:none;opacity:0;" +
      "translate:var(--orb-plus-x,0px) var(--orb-plus-y,0px);transform:scale(0.5);" +
      "filter:blur(3px) drop-shadow(0 1px 2px rgba(19,56,36,0));" +
      "transition:opacity 0.45s ease,transform 0.6s cubic-bezier(0.34,1.56,0.64,1),filter 0.45s ease;}",
    A + " .inspira-orb__plus svg{display:block;width:100%;height:100%;}",
    A + ":hover .inspira-orb__plus," + A + ":focus-visible .inspira-orb__plus{opacity:1;transform:scale(1);" +
      "filter:blur(0) drop-shadow(0 1px 2px rgba(19,56,36,0.35));}",
    "@media (hover:none){" + A + " .inspira-orb__plus{opacity:0.85;transform:scale(0.85);filter:none;}}",
    "@media (prefers-reduced-motion:reduce){" + A + " .inspira-orb__plus{transition:opacity 0.2s ease;transform:none;filter:none;}" +
      A + ":hover .inspira-orb__plus," + A + ":focus-visible .inspira-orb__plus{transform:none;filter:none;}}",
  ].join("");

  function mixPalette(timeMs) {
    var t = (((timeMs % CYCLE_MS) + CYCLE_MS) % CYCLE_MS) / CYCLE_MS;
    var scaled = t * PALETTE.length;
    var i = Math.floor(scaled) % PALETTE.length;
    var j = (i + 1) % PALETTE.length;
    var f = scaled - Math.floor(scaled);
    var a = PALETTE[i];
    var b = PALETTE[j];
    return { r: a.r + (b.r - a.r) * f, g: a.g + (b.g - a.g) * f, b: a.b + (b.b - a.b) * f };
  }

  function lighten(c, amount) {
    return { r: c.r + (255 - c.r) * amount, g: c.g + (255 - c.g) * amount, b: c.b + (255 - c.b) * amount };
  }

  function darken(c, amount) {
    return { r: c.r * (1 - amount), g: c.g * (1 - amount), b: c.b * (1 - amount) };
  }

  function rgba(c, a) {
    return "rgba(" + Math.round(c.r) + "," + Math.round(c.g) + "," + Math.round(c.b) + "," + a + ")";
  }

  function createLiquidOrb() {
    var blobs = [];
    for (var i = 0; i < 4; i++) {
      blobs.push({
        fx: 0.7 + Math.random() * 0.7,
        fy: 0.7 + Math.random() * 0.7,
        phase: Math.random() * TAU,
        colorOffset: (i / 4) * CYCLE_MS,
        size: 0.7 + Math.random() * 0.25,
      });
    }
    var waves = [
      { k: 2, amp: 1 },
      { k: 3, amp: 0.7 },
      { k: 5, amp: 0.35 },
    ].map(function (w) {
      w.speed = (0.0006 + Math.random() * 0.0005) * (Math.random() > 0.5 ? 1 : -1);
      w.phase = Math.random() * TAU;
      return w;
    });
    return { blobs: blobs, waves: waves, time: Math.random() * CYCLE_MS, hover: 0, near: 0, pointerAngle: -Math.PI / 4 };
  }

  function stepLiquidOrb(orb, dt, hovering, proximity, pointerAngle, reduced) {
    var targetHover = hovering ? 1 : 0;
    if (reduced) {
      orb.hover = targetHover;
      orb.near = 0;
      return;
    }
    dt = Math.min(Math.max(dt, 0), 64);
    var ease = 1 - Math.exp(-dt / 180);
    orb.hover += (targetHover - orb.hover) * ease;
    orb.near += (proximity - orb.near) * ease;
    var delta = Math.atan2(Math.sin(pointerAngle - orb.pointerAngle), Math.cos(pointerAngle - orb.pointerAngle));
    orb.pointerAngle += delta * ease;
    orb.time += dt * (1 + orb.hover * 0.9);
  }

  function liquidRadius(orb, theta, radius) {
    var wave = 0;
    for (var i = 0; i < orb.waves.length; i++) {
      var w = orb.waves[i];
      wave += w.amp * Math.sin(w.k * theta + orb.time * w.speed + w.phase);
    }
    var wobble = 0.022 + orb.hover * 0.018 + orb.near * 0.008;
    var lean = Math.max(0, Math.cos(theta - orb.pointerAngle));
    var bulge = 0.07 * orb.near * (1 - orb.hover * 0.6) * Math.pow(lean, 4);
    return radius * (1 + wobble * wave + bulge);
  }

  function traceOutline(ctx, orb, cx, cy, radius) {
    var points = [];
    var i;
    for (i = 0; i < SEGMENTS; i++) {
      var theta = (i / SEGMENTS) * TAU;
      var r = liquidRadius(orb, theta, radius);
      points.push([cx + Math.cos(theta) * r, cy + Math.sin(theta) * r]);
    }
    var first = points[0];
    var last = points[SEGMENTS - 1];
    ctx.beginPath();
    ctx.moveTo((last[0] + first[0]) / 2, (last[1] + first[1]) / 2);
    for (i = 0; i < SEGMENTS; i++) {
      var p = points[i];
      var n = points[(i + 1) % SEGMENTS];
      ctx.quadraticCurveTo(p[0], p[1], (p[0] + n[0]) / 2, (p[1] + n[1]) / 2);
    }
    ctx.closePath();
  }

  function drawLiquidOrb(ctx, orb, size) {
    var cx = size / 2;
    var cy = size / 2;
    var R = BASE_RADIUS * (1 + orb.hover * 0.14 + 0.025 * Math.sin(orb.time * 0.0011));
    var t = orb.time;
    var tint = mixPalette(t);
    var leanX = Math.cos(orb.pointerAngle) * orb.near;
    var leanY = Math.sin(orb.pointerAngle) * orb.near;
    var g;

    ctx.clearRect(0, 0, size, size);
    ctx.globalAlpha = 0.9 + orb.hover * 0.1;

    var pulse = 0.5 + 0.5 * Math.sin(t * 0.0009);
    g = ctx.createRadialGradient(cx, cy, R * 0.4, cx, cy, R * 1.9);
    g.addColorStop(0, rgba(tint, 0.26 + 0.12 * orb.hover + 0.06 * pulse));
    g.addColorStop(1, rgba(tint, 0));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(cx, cy, R * 1.9, 0, TAU);
    ctx.fill();

    ctx.save();
    ctx.translate(cx, cy + R * 0.98);
    ctx.scale(1, 0.28);
    g = ctx.createRadialGradient(0, 0, 0, 0, 0, R * 0.85);
    g.addColorStop(0, "rgba(" + FOREST + ",0.16)");
    g.addColorStop(1, "rgba(" + FOREST + ",0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, 0, R * 0.85, 0, TAU);
    ctx.fill();
    ctx.restore();

    ctx.save();
    traceOutline(ctx, orb, cx, cy, R);
    ctx.clip();

    g = ctx.createRadialGradient(cx - R * 0.3, cy - R * 0.35, R * 0.1, cx, cy, R * 1.1);
    g.addColorStop(0, rgba(lighten(tint, 0.6), 0.6));
    g.addColorStop(1, rgba(lighten(tint, 0.2), 0.5));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);

    var blobAlpha = 0.8 + 0.18 * orb.hover;
    for (var i = 0; i < orb.blobs.length; i++) {
      var blob = orb.blobs[i];
      var bx = cx + R * 0.48 * Math.sin(t * 0.00041 * blob.fx + blob.phase) + leanX * R * 0.22;
      var by = cy + R * 0.48 * Math.cos(t * 0.00033 * blob.fy + blob.phase * 1.3) + leanY * R * 0.22;
      var br = R * blob.size * (1 + orb.hover * 0.1);
      var color = mixPalette(t + blob.colorOffset);
      g = ctx.createRadialGradient(bx, by, 0, bx, by, br);
      g.addColorStop(0, rgba(color, blobAlpha));
      g.addColorStop(0.55, rgba(color, blobAlpha * 0.45));
      g.addColorStop(1, rgba(color, 0));
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(bx, by, br, 0, TAU);
      ctx.fill();
    }

    g = ctx.createRadialGradient(cx, cy, R * 0.6, cx, cy, R * 1.12);
    g.addColorStop(0, rgba(darken(tint, 0.35), 0));
    g.addColorStop(1, rgba(darken(tint, 0.35), 0.3));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);

    var causticX = cx + R * 0.18 - leanX * R * 0.1;
    var causticY = cy + R * 0.56 - leanY * R * 0.1;
    g = ctx.createRadialGradient(causticX, causticY, 0, causticX, causticY, R * 0.6);
    g.addColorStop(0, "rgba(255,255,255,0.5)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);

    ctx.save();
    ctx.translate(cx - R * 0.3 + leanX * R * 0.06, cy - R * 0.46 + leanY * R * 0.06);
    ctx.rotate(-0.5);
    ctx.scale(1, 0.52);
    g = ctx.createRadialGradient(0, 0, 0, 0, 0, R * 0.55);
    g.addColorStop(0, "rgba(255,255,255,0.95)");
    g.addColorStop(0.5, "rgba(255,255,255,0.35)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, 0, R * 0.55, 0, TAU);
    ctx.fill();
    ctx.restore();

    ctx.restore();

    traceOutline(ctx, orb, cx, cy, R + 0.4);
    ctx.lineWidth = 0.8;
    ctx.strokeStyle = "rgba(" + FOREST + ",0.18)";
    ctx.stroke();

    traceOutline(ctx, orb, cx, cy, R - 0.6);
    g = ctx.createLinearGradient(cx - R, cy - R, cx + R, cy + R);
    g.addColorStop(0, "rgba(255,255,255,0.95)");
    g.addColorStop(0.5, "rgba(255,255,255,0.2)");
    g.addColorStop(1, "rgba(255,255,255,0.65)");
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = g;
    ctx.stroke();

    ctx.globalAlpha = 1;

    return {
      x: leanX * 2 + Math.sin(t * 0.0011) * 0.8,
      y: leanY * 2 + Math.cos(t * 0.0009) * 0.8,
    };
  }

  function mount() {
    if (document.querySelector(A)) return;

    if (!document.getElementById(STYLE_ID)) {
      var style = document.createElement("style");
      style.id = STYLE_ID;
      style.textContent = css;
      document.head.appendChild(style);
    }

    var media = typeof window.matchMedia === "function" ? window.matchMedia(REDUCED_MOTION_QUERY) : null;
    var reduced = !!(media && media.matches);

    var link = document.createElement("a");
    link.className = ROOT_CLASS;
    link.href = href;
    link.setAttribute("aria-label", label);
    if (reduced) link.setAttribute("data-reduced-motion", "true");
    link.innerHTML =
      '<canvas aria-hidden="true"></canvas>' +
      '<span class="inspira-orb__plus" aria-hidden="true">' +
      '<svg viewBox="0 0 196 196" focusable="false">' +
      "<defs>" +
      '<linearGradient id="inspira-orb-plus-fill" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0" stop-color="#2c6a45"/>' +
      '<stop offset="0.55" stop-color="#133824"/>' +
      '<stop offset="1" stop-color="#0b2416"/>' +
      "</linearGradient>" +
      '<linearGradient id="inspira-orb-plus-sheen" x1="0" y1="0" x2="0.6" y2="0.6">' +
      '<stop offset="0" stop-color="#ffffff" stop-opacity="0.55"/>' +
      '<stop offset="1" stop-color="#ffffff" stop-opacity="0"/>' +
      "</linearGradient>" +
      "</defs>" +
      '<path d="M75 19 H121 V75 H177 V121 H121 V177 H75 V121 H19 V75 H75 V19 Z" ' +
      'fill="url(#inspira-orb-plus-fill)" stroke="url(#inspira-orb-plus-fill)" ' +
      'stroke-width="14" stroke-linejoin="round"/>' +
      '<path d="M75 19 H121 V75 H177 V121 H121 V177 H75 V121 H19 V75 H75 V19 Z" ' +
      'fill="url(#inspira-orb-plus-sheen)"/>' +
      "</svg>" +
      "</span>";
    document.body.appendChild(link);

    var canvas = link.querySelector("canvas");
    var plus = link.querySelector(".inspira-orb__plus");
    var ctx = canvas.getContext && canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    var orb = createLiquidOrb();
    var size = 0;
    var frame = 0;
    var last = 0;
    var hovering = false;
    var proximity = 0;
    var pointerAngle = -Math.PI / 4;

    function resize() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      size = canvas.clientWidth || 104;
      canvas.width = Math.round(size * dpr);
      canvas.height = Math.round(size * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function render(dt) {
      stepLiquidOrb(orb, dt, hovering, proximity, pointerAngle, reduced);
      var offset = drawLiquidOrb(ctx, orb, size);
      plus.style.setProperty("--orb-plus-x", offset.x.toFixed(2) + "px");
      plus.style.setProperty("--orb-plus-y", offset.y.toFixed(2) + "px");
    }

    function tick(now) {
      var dt = last ? now - last : 16;
      last = now;
      render(dt);
      frame = reduced ? 0 : requestAnimationFrame(tick);
    }

    function redraw() {
      if (reduced) {
        cancelAnimationFrame(frame);
        frame = 0;
        render(0);
      } else if (!frame) {
        last = 0;
        frame = requestAnimationFrame(tick);
      }
    }

    function setHover(value) {
      return function () {
        hovering = value;
        redraw();
      };
    }

    var moveEvent = "PointerEvent" in window ? "pointermove" : "mousemove";
    window.addEventListener(
      moveEvent,
      function (event) {
        if (event.pointerType && event.pointerType !== "mouse") return;
        var rect = link.getBoundingClientRect();
        var dx = event.clientX - (rect.left + rect.width / 2);
        var dy = event.clientY - (rect.top + rect.height / 2);
        var distance = Math.hypot(dx, dy) - rect.width / 2;
        proximity = Math.min(1, Math.max(0, 1 - distance / PROXIMITY_RANGE));
        pointerAngle = Math.atan2(dy, dx);
      },
      { passive: true }
    );
    window.addEventListener("resize", resize);
    link.addEventListener("mouseenter", setHover(true));
    link.addEventListener("mouseleave", setHover(false));
    link.addEventListener("focus", setHover(true));
    link.addEventListener("blur", setHover(false));
    if (media && media.addEventListener) {
      media.addEventListener("change", function () {
        reduced = media.matches;
        if (reduced) link.setAttribute("data-reduced-motion", "true");
        else link.removeAttribute("data-reduced-motion");
        redraw();
      });
    }

    resize();
    redraw();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount);
  } else {
    mount();
  }
})();
