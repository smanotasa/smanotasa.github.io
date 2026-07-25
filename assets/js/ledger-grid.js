(() => {
  const canvas = document.getElementById("ledger-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const container = canvas.parentElement;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const ROW_HEIGHT = 30;
  const CELL_WIDTH = 108;
  const CELL_HEIGHT = 20;

  let dpr = Math.min(window.devicePixelRatio || 1, 2);
  let width = 0;
  let height = 0;
  let rowCount = 0;
  let pointer = { x: -9999, y: -9999, active: false };
  let rafId = null;

  // The active-cell highlight must never paint over the name/tagline —
  // this rect (in canvas-local coordinates) marks that no-draw zone.
  const textEl = container.querySelector(".hero-copy");
  let textZone = null;

  function refreshTextZone() {
    if (!textEl) { textZone = null; return; }
    const containerRect = container.getBoundingClientRect();
    const textRect = textEl.getBoundingClientRect();
    textZone = {
      left: textRect.left - containerRect.left - 12,
      top: textRect.top - containerRect.top - 12,
      right: textRect.right - containerRect.left + 12,
      bottom: textRect.bottom - containerRect.top + 12,
    };
  }

  function cellIntersectsText(cellX, cellY, cellW, cellH) {
    if (!textZone) return false;
    return (
      cellX < textZone.right &&
      cellX + cellW > textZone.left &&
      cellY < textZone.bottom &&
      cellY + cellH > textZone.top
    );
  }

  // Style is cached and only refreshed on resize/theme change,
  // never inside the per-frame draw loop (previously a getComputedStyle
  // call per property, per frame, while the pointer moved).
  let style = { rule: "20, 22, 26", baseAlpha: 0.1, activeAlpha: 0.55, accent: "#354a21" };

  function refreshStyle() {
    const cs = getComputedStyle(document.documentElement);
    style = {
      rule: (cs.getPropertyValue("--rule-color") || "20, 22, 26").trim(),
      baseAlpha: parseFloat(cs.getPropertyValue("--rule-base-opacity")) || 0.1,
      activeAlpha: parseFloat(cs.getPropertyValue("--rule-active-opacity")) || 0.55,
      accent: (cs.getPropertyValue("--accent") || "#354a21").trim(),
    };
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
    rowCount = Math.ceil(height / ROW_HEIGHT) + 1;
    refreshStyle();
    refreshTextZone();
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    ctx.font = "9px ui-monospace, 'JetBrains Mono', monospace";
    ctx.textBaseline = "middle";

    const nearRow = pointer.active ? Math.round(pointer.y / ROW_HEIGHT) : -1;

    for (let r = 0; r < rowCount; r++) {
      const y = r * ROW_HEIGHT;
      const isNear = r === nearRow;

      ctx.strokeStyle = `rgba(${style.rule}, ${isNear ? style.activeAlpha * 0.5 : style.baseAlpha})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, y + 0.5);
      ctx.lineTo(width, y + 0.5);
      ctx.stroke();

      const label = String(r + 1).padStart(2, "0");
      ctx.fillStyle = `rgba(${style.rule}, ${isNear ? style.activeAlpha : style.baseAlpha * 1.3})`;
      ctx.fillText(label, 4, y - 8);
    }

    if (pointer.active && nearRow >= 0 && nearRow < rowCount) {
      const y = nearRow * ROW_HEIGHT;
      const cellX = Math.max(0, Math.min(width - CELL_WIDTH, pointer.x - CELL_WIDTH / 2));
      const cellTop = y - CELL_HEIGHT / 2;

      if (cellIntersectsText(cellX, cellTop, CELL_WIDTH, CELL_HEIGHT)) return;

      ctx.fillStyle = style.accent;
      ctx.globalAlpha = 0.14;
      ctx.fillRect(cellX, y - CELL_HEIGHT / 2, CELL_WIDTH, CELL_HEIGHT);
      ctx.globalAlpha = 1;

      ctx.strokeStyle = style.accent;
      ctx.globalAlpha = 0.6;
      ctx.lineWidth = 1;
      ctx.strokeRect(cellX + 0.5, y - CELL_HEIGHT / 2 + 0.5, CELL_WIDTH - 1, CELL_HEIGHT - 1);
      ctx.globalAlpha = 1;
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
  media.addEventListener("change", () => {
    refreshStyle();
    draw();
  });
  window.addEventListener("storage", (e) => {
    if (e.key === "theme") {
      refreshStyle();
      draw();
    }
  });
  document.getElementById("theme-toggle")?.addEventListener("click", () => {
    setTimeout(() => {
      refreshStyle();
      draw();
    }, 0);
  });

  resize();
  draw();
})();
