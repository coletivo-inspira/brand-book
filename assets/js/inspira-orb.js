/*
 * Orb +INSPIRA — selo flutuante estilo LINO para sites/subdomínios do Coletivo.
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

  var css =
    "a." +
    ROOT_CLASS +
    "{" +
    "--orb-size:5.25rem;" +
    "--orb-lime:#BAFF29;" +
    "--orb-forest:#133824;" +
    "position:fixed;" +
    "left:0.85rem;" +
    "bottom:0.85rem;" +
    "z-index:70;" +
    "width:var(--orb-size);" +
    "height:var(--orb-size);" +
    "display:grid;" +
    "place-items:center;" +
    "border-radius:50%;" +
    "text-decoration:none;" +
    "background:transparent;" +
    "isolation:isolate;" +
    "outline:none;" +
    "-webkit-tap-highlight-color:transparent;" +
    "}" +
    "a." +
    ROOT_CLASS +
    ":focus-visible{" +
    "box-shadow:0 0 0 2px var(--orb-forest),0 0 0 4px var(--orb-lime);" +
    "}" +
    "a." +
    ROOT_CLASS +
    " canvas{" +
    "position:absolute;inset:0;width:100%;height:100%;pointer-events:none;" +
    "}" +
    "a." +
    ROOT_CLASS +
    " .inspira-orb__plus{" +
    "position:relative;z-index:2;width:38%;height:38%;border-radius:22%;" +
    "background:var(--orb-lime);border:1.5px solid var(--orb-forest);" +
    "box-shadow:2px 2px 0 rgba(19,56,36,0.45);" +
    "display:grid;place-items:center;opacity:0;" +
    "transform:scale(0.55) rotate(-12deg);" +
    "transition:opacity 0.32s ease,transform 0.4s cubic-bezier(0.34,1.56,0.64,1);" +
    "pointer-events:none;" +
    "}" +
    "a." +
    ROOT_CLASS +
    " .inspira-orb__plus svg{width:62%;height:62%;display:block;}" +
    "a." +
    ROOT_CLASS +
    ":hover .inspira-orb__plus," +
    "a." +
    ROOT_CLASS +
    ":focus-visible .inspira-orb__plus{" +
    "opacity:1;transform:scale(1) rotate(0deg);" +
    "animation:inspira-orb-plus-spin 2.8s linear infinite;animation-delay:0.28s;" +
    "}" +
    "a." +
    ROOT_CLASS +
    "[data-reduced-motion='true']:hover .inspira-orb__plus," +
    "a." +
    ROOT_CLASS +
    "[data-reduced-motion='true']:focus-visible .inspira-orb__plus{" +
    "animation:none;transform:scale(1) rotate(0deg);" +
    "}" +
    "@keyframes inspira-orb-plus-spin{to{transform:scale(1) rotate(360deg);}}" +
    "@media (prefers-reduced-motion:reduce){" +
    "a." +
    ROOT_CLASS +
    ":hover .inspira-orb__plus," +
    "a." +
    ROOT_CLASS +
    ":focus-visible .inspira-orb__plus{animation:none;}" +
    "}";

  function mixPalette(nowMs) {
    var t = (nowMs % CYCLE_MS) / CYCLE_MS;
    var scaled = t * PALETTE.length;
    var i = Math.floor(scaled) % PALETTE.length;
    var j = (i + 1) % PALETTE.length;
    var f = scaled - Math.floor(scaled);
    var a = PALETTE[i];
    var b = PALETTE[j];
    return {
      r: a.r + (b.r - a.r) * f,
      g: a.g + (b.g - a.g) * f,
      b: a.b + (b.b - a.b) * f,
    };
  }

  function lighten(c, amount) {
    return {
      r: c.r + (255 - c.r) * amount,
      g: c.g + (255 - c.g) * amount,
      b: c.b + (255 - c.b) * amount,
    };
  }

  function rgba(c, a) {
    return "rgba(" + Math.round(c.r) + "," + Math.round(c.g) + "," + Math.round(c.b) + "," + a + ")";
  }

  function createOrbSystem(count) {
    var sats = [];
    for (var i = 0; i < count; i++) {
      var dir = Math.random() > 0.5 ? 1 : -1;
      var baseRadius = 16 + Math.random() * 20;
      sats.push({
        angle: Math.random() * TAU,
        baseRadius: baseRadius,
        radius: baseRadius,
        speed: dir * (0.008 + Math.random() * 0.01),
        size: 1.4 + Math.random() * 2,
        phase: Math.random() * TAU,
      });
    }
    return { sats: sats };
  }

  function drawFrame(ctx, size, now, system, engaged, reduced, breath) {
    ctx.clearRect(0, 0, size, size);
    var cx = size * 0.5;
    var cy = size * 0.5;
    var color = mixPalette(now);
    var hi = lighten(color, 0.55);
    var soft = lighten(color, 0.25);
    var alpha = 0.92;
    var speedBoost = reduced ? 0 : 1 + (engaged ? 2.4 : 0);
    var breathFactor = 0.9 + Math.sin(breath) * 0.08 + (engaged ? 0.08 : 0);
    var i;
    var sat;

    for (i = 0; i < system.sats.length; i++) {
      sat = system.sats[i];
      if (!reduced) sat.angle += sat.speed * speedBoost;
      var orbitRadius = sat.baseRadius * (1 + 0.12 * Math.sin(now * 0.0017 + sat.phase));
      var fusedRadius = 7 + 2.2 * Math.sin(now * 0.005 + sat.phase);
      var fusion = engaged && !reduced ? 0.35 : 0;
      var targetRadius = orbitRadius * (1 - fusion) + fusedRadius * fusion;
      sat.radius += (targetRadius - sat.radius) * (0.08 + fusion * 0.12);

      var sx = cx + Math.cos(sat.angle) * sat.radius;
      var sy = cy + Math.sin(sat.angle) * sat.radius;
      var satAlpha = alpha * (0.55 + fusion * 0.2);

      ctx.beginPath();
      ctx.fillStyle = rgba(soft, satAlpha * 0.35);
      ctx.arc(sx, sy, sat.size * 2.6, 0, TAU);
      ctx.fill();

      ctx.beginPath();
      ctx.fillStyle = rgba(hi, satAlpha);
      ctx.arc(sx, sy, sat.size, 0, TAU);
      ctx.fill();
    }

    var glowRadius = (34 + Math.sin(breath * 0.6) * 4) * breathFactor;
    var innerRadius = 7.5 * breathFactor;

    var glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowRadius);
    glow.addColorStop(0, rgba(hi, 0.28 * alpha));
    glow.addColorStop(0.45, rgba(soft, 0.1 * alpha));
    glow.addColorStop(1, rgba(color, 0));
    ctx.beginPath();
    ctx.fillStyle = glow;
    ctx.arc(cx, cy, glowRadius, 0, TAU);
    ctx.fill();

    var core = ctx.createRadialGradient(cx, cy, 0, cx, cy, innerRadius);
    core.addColorStop(0, rgba(hi, 0.9 * alpha));
    core.addColorStop(1, rgba(color, 0.06 * alpha));
    ctx.beginPath();
    ctx.fillStyle = core;
    ctx.arc(cx, cy, innerRadius, 0, TAU);
    ctx.fill();

    if (engaged && !reduced) {
      var spin = now * 0.0025;
      for (i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.strokeStyle = rgba(hi, alpha * (0.18 - i * 0.04));
        ctx.lineWidth = 1.2 - i * 0.2;
        ctx.arc(cx, cy, 16 + i * 5, spin + i * 0.9, spin + i * 0.9 + 2.1);
        ctx.stroke();
      }
    }
  }

  function mount() {
    if (document.querySelector("a." + ROOT_CLASS)) return;

    if (!document.getElementById(STYLE_ID)) {
      var style = document.createElement("style");
      style.id = STYLE_ID;
      style.textContent = css;
      document.head.appendChild(style);
    }

    var link = document.createElement("a");
    link.className = ROOT_CLASS;
    link.href = href;
    link.setAttribute("aria-label", label);
    link.rel = "noopener noreferrer";

    var reduced =
      typeof window.matchMedia === "function" &&
      window.matchMedia(REDUCED_MOTION_QUERY).matches;
    if (reduced) link.setAttribute("data-reduced-motion", "true");

    link.innerHTML =
      '<canvas aria-hidden="true"></canvas>' +
      '<span class="inspira-orb__plus" aria-hidden="true">' +
      '<svg viewBox="0 0 196 196" focusable="false">' +
      '<path d="M75 19 H121 V75 H177 V121 H121 V177 H75 V121 H19 V75 H75 V19 Z" fill="#133824"/>' +
      "</svg>" +
      "</span>";

    document.body.appendChild(link);

    var canvas = link.querySelector("canvas");
    var ctx = canvas && canvas.getContext && canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    var system = createOrbSystem(12);
    var engaged = false;
    var breath = 0;
    var size = 84;

    function resize() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      size = canvas.clientWidth || 84;
      canvas.width = size * dpr;
      canvas.height = size * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    resize();
    window.addEventListener("resize", resize);

    link.addEventListener("mouseenter", function () {
      engaged = true;
    });
    link.addEventListener("mouseleave", function () {
      engaged = false;
    });
    link.addEventListener("focus", function () {
      engaged = true;
    });
    link.addEventListener("blur", function () {
      engaged = false;
    });

    function tick(now) {
      breath += reduced ? 0 : 0.012;
      drawFrame(ctx, size, now, system, engaged, reduced, breath);
      requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount);
  } else {
    mount();
  }
})();
