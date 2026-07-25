(() => {
  const button = document.querySelector(".copy-email");
  if (!button) return;

  const label = button.querySelector(".copy-email-text");
  const email = button.dataset.email;
  const original = label.textContent;
  let resetTimer = null;

  button.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(email);
    } catch {
      return; // Clipboard denied/unavailable — the address is still visible to select by hand.
    }

    button.classList.add("is-copied");
    label.textContent = "Copied to clipboard";
    clearTimeout(resetTimer);
    resetTimer = setTimeout(() => {
      button.classList.remove("is-copied");
      label.textContent = original;
    }, 1600);
  });
})();
