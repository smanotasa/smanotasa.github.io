(() => {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (!("IntersectionObserver" in window)) return;

  const targets = [];
  document.querySelectorAll(".section-head").forEach((el) => targets.push([el, 0]));
  document.querySelectorAll(".timeline > .timeline-item").forEach((el, i) => targets.push([el, i]));
  document.querySelectorAll(".edu-list > .edu-row").forEach((el, i) => targets.push([el, i]));
  document.querySelectorAll(".skills-grid > div").forEach((el, i) => targets.push([el, i]));
  document
    .querySelectorAll("#projects .featured-project, #projects .project-card")
    .forEach((el, i) => targets.push([el, i]));

  const STAGGER_MS = 70;
  const MAX_STEPS = 6;
  const pending = new Set();

  function reveal(el) {
    if (!pending.has(el)) return;
    pending.delete(el);
    observer.unobserve(el);
    el.classList.remove("reveal-hidden");
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) reveal(entry.target);
      }
    },
    { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
  );

  // A large or instant scroll jump (nav link, deep link, Page Down/End,
  // fast fling, a browser that coalesces scroll frames) can move the
  // viewport past a hidden element without the browser ever painting a
  // frame where it overlapped the viewport — IntersectionObserver simply
  // never fires for it, and it stays invisible forever. This sweep catches
  // anything left pending that has already scrolled fully off the top;
  // it can never naturally re-enter view while scrolling down, so it just
  // appears immediately instead of staying blank.
  function sweepPassedElements() {
    for (const el of pending) {
      if (el.getBoundingClientRect().bottom < 0) reveal(el);
    }
  }

  let scrollScheduled = false;
  window.addEventListener(
    "scroll",
    () => {
      if (scrollScheduled) return;
      scrollScheduled = true;
      requestAnimationFrame(() => {
        scrollScheduled = false;
        sweepPassedElements();
      });
    },
    { passive: true }
  );

  window.addEventListener("hashchange", () => {
    for (const el of [...pending]) reveal(el);
  });

  for (const [el, i] of targets) {
    el.classList.add("reveal");

    // Content already on screen at load never animates — no flash,
    // nothing about the page's substance depends on scrolling to appear.
    const rect = el.getBoundingClientRect();
    const alreadyVisible = rect.top < window.innerHeight * 0.9 && rect.bottom > 0;
    if (alreadyVisible) continue;

    el.style.transitionDelay = `${(i % MAX_STEPS) * STAGGER_MS}ms`;
    el.classList.add("reveal-hidden");
    pending.add(el);
    observer.observe(el);
  }

  // A direct deep link (e.g. shared as .../#projects) has no natural
  // scroll-in moment either — skip the choreography entirely.
  if (location.hash) {
    for (const el of [...pending]) reveal(el);
  }
})();
