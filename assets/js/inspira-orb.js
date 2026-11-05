/*
 * Orb +INSPIRA — selo flutuante para sites/subdomínios do Coletivo.
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
  var DEFAULT_HREF = "https://inspira.dev.br/";
  var DEFAULT_LABEL = "Coletivo Inspira — ir ao site oficial";
  var ROOT_CLASS = "inspira-orb";
  var STYLE_ID = "inspira-orb-styles";
  var REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

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
    "--orb-lime:#BAFF29;" +
    "--orb-mint:#A3E5C2;" +
    "--orb-orange:#F05D23;" +
    "--orb-forest:#133824;" +
    "--orb-core:var(--orb-lime);" +
    "--orb-glow:var(--orb-mint);" +
    "--orb-accent:var(--orb-orange);" +
    "--orb-size:4rem;" +
    "position:fixed;" +
    "left:1.1rem;" +
    "bottom:1.1rem;" +
    "z-index:70;" +
    "width:var(--orb-size);" +
    "height:var(--orb-size);" +
    "display:grid;" +
    "place-items:center;" +
    "border-radius:50%;" +
    "text-decoration:none;" +
    "isolation:isolate;" +
    "outline:none;" +
    "transform:translateZ(0);" +
    "animation:inspira-orb-palette 14s ease-in-out infinite;" +
    "}" +
    "a." +
    ROOT_CLASS +
    ":focus-visible{" +
    "box-shadow:0 0 0 3px var(--orb-forest),0 0 0 6px var(--orb-lime);" +
    "}" +
    "a." +
    ROOT_CLASS +
    " .inspira-orb__stage{" +
    "position:relative;" +
    "width:100%;" +
    "height:100%;" +
    "border-radius:50%;" +
    "}" +
    "a." +
    ROOT_CLASS +
    " .inspira-orb__aura{" +
    "position:absolute;" +
    "inset:-18%;" +
    "border-radius:50%;" +
    "background:radial-gradient(circle,color-mix(in srgb,var(--orb-glow) 55%,transparent) 0%,transparent 68%);" +
    "filter:blur(6px);" +
    "opacity:0.85;" +
    "pointer-events:none;" +
    "animation:inspira-orb-breathe 4.8s ease-in-out infinite;" +
    "}" +
    "a." +
    ROOT_CLASS +
    " .inspira-orb__core{" +
    "position:absolute;" +
    "inset:18%;" +
    "border-radius:50%;" +
    "overflow:hidden;" +
    "filter:contrast(1.15);" +
    "background:radial-gradient(circle at 40% 35%,#fff8 0%,transparent 42%)," +
    "radial-gradient(circle at 50% 50%,var(--orb-core) 0%,color-mix(in srgb,var(--orb-glow) 70%,var(--orb-accent)) 55%,transparent 72%);" +
    "box-shadow:0 0 18px color-mix(in srgb,var(--orb-glow) 55%,transparent);" +
    "}" +
    "a." +
    ROOT_CLASS +
    " .inspira-orb__blob{" +
    "position:absolute;" +
    "border-radius:50%;" +
    "filter:blur(5px);" +
    "opacity:0.92;" +
    "}" +
    "a." +
    ROOT_CLASS +
    " .inspira-orb__blob--a{" +
    "width:58%;height:58%;left:8%;top:14%;" +
    "background:radial-gradient(circle,var(--orb-core),transparent 70%);" +
    "animation:inspira-orb-drift-a 6.4s ease-in-out infinite;" +
    "}" +
    "a." +
    ROOT_CLASS +
    " .inspira-orb__blob--b{" +
    "width:48%;height:48%;right:4%;bottom:10%;" +
    "background:radial-gradient(circle,var(--orb-glow),transparent 70%);" +
    "animation:inspira-orb-drift-b 7.2s ease-in-out infinite;" +
    "}" +
    "a." +
    ROOT_CLASS +
    " .inspira-orb__blob--c{" +
    "width:36%;height:36%;left:34%;bottom:8%;" +
    "background:radial-gradient(circle,var(--orb-accent),transparent 70%);" +
    "animation:inspira-orb-drift-c 5.6s ease-in-out infinite;" +
    "}" +
    "a." +
    ROOT_CLASS +
    " .inspira-orb__rings{" +
    "position:absolute;" +
    "inset:0;" +
    "border-radius:50%;" +
    "animation:inspira-orb-spin 18s linear infinite;" +
    "pointer-events:none;" +
    "}" +
    "a." +
    ROOT_CLASS +
    " .inspira-orb__ring{" +
    "position:absolute;" +
    "inset:4%;" +
    "border-radius:50%;" +
    "border:1px solid color-mix(in srgb,var(--orb-glow) 45%,transparent);" +
    "border-top-color:transparent;" +
    "border-left-color:transparent;" +
    "opacity:0.7;" +
    "}" +
    "a." +
    ROOT_CLASS +
    " .inspira-orb__ring--inner{" +
    "inset:14%;" +
    "border-color:color-mix(in srgb,var(--orb-accent) 40%,transparent);" +
    "border-bottom-color:transparent;" +
    "border-right-color:transparent;" +
    "animation:inspira-orb-spin-rev 12s linear infinite;" +
    "}" +
    "a." +
    ROOT_CLASS +
    " .inspira-orb__sat{" +
    "position:absolute;" +
    "width:0.35rem;height:0.35rem;" +
    "border-radius:50%;" +
    "background:var(--orb-core);" +
    "box-shadow:0 0 8px var(--orb-glow);" +
    "}" +
    "a." +
    ROOT_CLASS +
    " .inspira-orb__sat--1{top:8%;left:46%;}" +
    "a." +
    ROOT_CLASS +
    " .inspira-orb__sat--2{bottom:14%;right:6%;width:0.28rem;height:0.28rem;background:var(--orb-accent);}" +
    "a." +
    ROOT_CLASS +
    " .inspira-orb__sat--3{top:42%;left:2%;width:0.22rem;height:0.22rem;background:var(--orb-mint);}" +
    "a." +
    ROOT_CLASS +
    " .inspira-orb__plus{" +
    "position:absolute;" +
    "inset:28%;" +
    "border-radius:22%;" +
    "background:var(--orb-lime);" +
    "border:1.5px solid var(--orb-forest);" +
    "box-shadow:2px 2px 0 color-mix(in srgb,var(--orb-forest) 55%,transparent);" +
    "display:grid;" +
    "place-items:center;" +
    "opacity:0;" +
    "transform:scale(0.55) rotate(-18deg);" +
    "transition:opacity 0.28s ease,transform 0.35s cubic-bezier(0.34,1.56,0.64,1);" +
    "z-index:2;" +
    "pointer-events:none;" +
    "}" +
    "a." +
    ROOT_CLASS +
    " .inspira-orb__plus svg{" +
    "width:62%;" +
    "height:62%;" +
    "display:block;" +
    "}" +
    "a." +
    ROOT_CLASS +
    ":hover .inspira-orb__plus," +
    "a." +
    ROOT_CLASS +
    ":focus-visible .inspira-orb__plus{" +
    "opacity:1;" +
    "transform:scale(1) rotate(0deg);" +
    "}" +
    "a." +
    ROOT_CLASS +
    ":hover," +
    "a." +
    ROOT_CLASS +
    ":focus-visible{" +
    "transform:scale(1.06);" +
    "}" +
    "a." +
    ROOT_CLASS +
    ":hover .inspira-orb__rings," +
    "a." +
    ROOT_CLASS +
    ":focus-visible .inspira-orb__rings{" +
    "animation-duration:5.5s;" +
    "}" +
    "a." +
    ROOT_CLASS +
    ":hover .inspira-orb__ring--inner," +
    "a." +
    ROOT_CLASS +
    ":focus-visible .inspira-orb__ring--inner{" +
    "animation-duration:3.8s;" +
    "}" +
    "@keyframes inspira-orb-palette{" +
    "0%,100%{--orb-core:var(--orb-lime);--orb-glow:var(--orb-mint);--orb-accent:var(--orb-orange);}" +
    "33%{--orb-core:var(--orb-mint);--orb-glow:var(--orb-lime);--orb-accent:var(--orb-orange);}" +
    "66%{--orb-core:var(--orb-orange);--orb-glow:var(--orb-mint);--orb-accent:var(--orb-lime);}" +
    "}" +
    "@keyframes inspira-orb-spin{to{transform:rotate(360deg);}}" +
    "@keyframes inspira-orb-spin-rev{to{transform:rotate(-360deg);}}" +
    "@keyframes inspira-orb-breathe{" +
    "0%,100%{transform:scale(0.96);opacity:0.7;}" +
    "50%{transform:scale(1.08);opacity:1;}" +
    "}" +
    "@keyframes inspira-orb-drift-a{" +
    "0%,100%{transform:translate(0,0) scale(1);}" +
    "50%{transform:translate(12%,8%) scale(1.12);}" +
    "}" +
    "@keyframes inspira-orb-drift-b{" +
    "0%,100%{transform:translate(0,0) scale(1);}" +
    "50%{transform:translate(-10%,-12%) scale(1.08);}" +
    "}" +
    "@keyframes inspira-orb-drift-c{" +
    "0%,100%{transform:translate(0,0) scale(1);}" +
    "50%{transform:translate(8%,-10%) scale(1.16);}" +
    "}" +
    "@media (prefers-reduced-motion:reduce){" +
    "a." +
    ROOT_CLASS +
    "," +
    "a." +
    ROOT_CLASS +
    " .inspira-orb__aura," +
    "a." +
    ROOT_CLASS +
    " .inspira-orb__blob," +
    "a." +
    ROOT_CLASS +
    " .inspira-orb__rings," +
    "a." +
    ROOT_CLASS +
    " .inspira-orb__ring--inner{" +
    "animation:none !important;" +
    "}" +
    "a." +
    ROOT_CLASS +
    "{" +
    "--orb-core:var(--orb-lime);" +
    "--orb-glow:var(--orb-mint);" +
    "--orb-accent:var(--orb-orange);" +
    "}" +
    "}";

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
    if (/^https?:\/\//i.test(href)) link.target = "_self";

    var reduced =
      typeof window.matchMedia === "function" && window.matchMedia(REDUCED_MOTION_QUERY).matches;
    if (reduced) link.setAttribute("data-reduced-motion", "true");

    link.innerHTML =
      '<span class="inspira-orb__stage" aria-hidden="true">' +
      '<span class="inspira-orb__aura"></span>' +
      '<span class="inspira-orb__rings">' +
      '<span class="inspira-orb__ring"></span>' +
      '<span class="inspira-orb__ring inspira-orb__ring--inner"></span>' +
      '<span class="inspira-orb__sat inspira-orb__sat--1"></span>' +
      '<span class="inspira-orb__sat inspira-orb__sat--2"></span>' +
      '<span class="inspira-orb__sat inspira-orb__sat--3"></span>' +
      "</span>" +
      '<span class="inspira-orb__core">' +
      '<span class="inspira-orb__blob inspira-orb__blob--a"></span>' +
      '<span class="inspira-orb__blob inspira-orb__blob--b"></span>' +
      '<span class="inspira-orb__blob inspira-orb__blob--c"></span>' +
      "</span>" +
      '<span class="inspira-orb__plus">' +
      '<svg viewBox="0 0 196 196" focusable="false">' +
      '<path d="M75 19 H121 V75 H177 V121 H121 V177 H75 V121 H19 V75 H75 V19 Z" fill="#133824"/>' +
      "</svg>" +
      "</span>" +
      "</span>";

    document.body.appendChild(link);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount);
  } else {
    mount();
  }
})();
