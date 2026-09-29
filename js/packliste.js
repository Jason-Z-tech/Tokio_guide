// Packliste: Häkchen im Browser merken (window.tokioStore), Fortschritt anzeigen, zurücksetzen und drucken.
// Ohne Speicher funktioniert die Liste weiter, merkt sich die Häkchen aber nicht.
"use strict";

(function () {
  const list = document.querySelector("[data-packlist]");
  if (!list) return;

  const STORAGE_KEY = "tokio-packliste";
  const store = window.tokioStore;
  const boxes = [...list.querySelectorAll('input[type="checkbox"]')];
  const status = document.querySelector("[data-pack-status]");
  const bar = document.querySelector("[data-pack-bar]");
  const noStoreHint = document.querySelector("[data-pack-nostore]");

  function loadChecked() {
    const saved = store ? store.get(STORAGE_KEY, {}) : {};
    return saved && typeof saved === "object" && !Array.isArray(saved) ? saved : {};
  }

  function saveChecked() {
    const checked = {};
    for (const box of boxes) {
      if (box.checked) checked[box.id] = true;
    }
    const ok = store ? store.set(STORAGE_KEY, checked) : false;
    if (noStoreHint) noStoreHint.hidden = ok;
  }

  function updateProgress() {
    const done = boxes.filter((box) => box.checked).length;
    const total = boxes.length;
    if (status) status.textContent = `${done} von ${total} erledigt`;
    if (bar) bar.style.width = total ? `${(done / total) * 100}%` : "0";
  }

  function restore() {
    const checked = loadChecked();
    for (const box of boxes) box.checked = checked[box.id] === true;
  }

  list.addEventListener("change", (event) => {
    if (!boxes.includes(event.target)) return;
    saveChecked();
    updateProgress();
  });

  document.querySelector("[data-pack-reset]")?.addEventListener("click", () => {
    if (!window.confirm("Alle Häkchen der Packliste löschen?")) return;
    for (const box of boxes) box.checked = false;
    store?.remove(STORAGE_KEY);
    updateProgress();
    boxes[0]?.focus();
  });

  document.querySelector("[data-pack-print]")?.addEventListener("click", () => window.print());

  restore();
  updateProgress();
})();
