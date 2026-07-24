(() => {
  const canvas = document.getElementById("dot-grid");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const container = canvas.parentElement;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const SPACING = 26;
  const RADIUS = 1.3;
  const INFLUENCE = 140;

  let dpr = Math.min(window.devicePixelRatio || 1, 2);
  let width = 0;
  let height = 0;
  let dots = [];
  let pointer = { x: -9999, y: -9999, active: false };
  let rafId = null;

  function styleFor(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }

  function buildDots() {
    dots = [];
    const cols = Math.ceil(width / SPACING) + 1;
    const rows = Math.ceil(height / SPACING) + 1;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        dots.push({ x: c * SPACING, y: r * SPACING });
      }
    }
  }

  function resize() {
    const rect = container.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    buildDots();
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    const rgb = styleFor("--dot-color") || "20, 22, 26";
    const baseAlpha = parseFloat(styleFor("--dot-base-opacity")) || 0.16;
    const activeAlpha = parseFloat(styleFor("--dot-active-opacity")) || 0.9;
    const accent = styleFor("--accent") || "#4338ca";

    for (const dot of dots) {
      let alpha = baseAlpha;
      let color = `rgba(${rgb}, ${alpha})`;
      let r = RADIUS;

      if (pointer.active) {
        const dx = dot.x - pointer.x;
        const dy = dot.y - pointer.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < INFLUENCE) {
          const t = 1 - dist / INFLUENCE;
          alpha = baseAlpha + (activeAlpha - baseAlpha) * t;
          r = RADIUS + t * 1.6;
          ctx.beginPath();
          ctx.arc(dot.x, dot.y, r, 0, Math.PI * 2);
          ctx.fillStyle = accent;
          ctx.globalAlpha = alpha;
          ctx.fill();
          ctx.globalAlpha = 1;
          continue;
        }
      }

      ctx.beginPath();
      ctx.arc(dot.x, dot.y, r, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
    }
  }

  function loop() {
    draw();
    if (pointer.active && !reduceMotion) {
      rafId = requestAnimationFrame(loop);
    } else {
      rafId = null;
    }
  }

  function requestDraw() {
    if (rafId === null) rafId = requestAnimationFrame(loop);
  }

  container.addEventListener("pointermove", (e) => {
    if (reduceMotion) return;
    const rect = container.getBoundingClientRect();
    pointer.x = e.clientX - rect.left;
    pointer.y = e.clientY - rect.top;
    pointer.active = true;
    requestDraw();
  });

  container.addEventListener("pointerleave", () => {
    pointer.active = false;
    requestDraw();
  });

  window.addEventListener("resize", () => {
    resize();
    draw();
  });

  const media = window.matchMedia("(prefers-color-scheme: dark)");
  media.addEventListener("change", draw);
  window.addEventListener("storage", (e) => {
    if (e.key === "theme") draw();
  });
  document.getElementById("theme-toggle")?.addEventListener("click", () => {
    setTimeout(draw, 0);
  });

  resize();
  draw();
})();
