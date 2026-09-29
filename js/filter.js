// Filter für Karten-Listen: Kategorie-Chips, Zusatz-Chips (Tags) und Textsuche.
// Erwartet [data-filter-list] mit Kindern, die data-kategorie, data-tags und data-suche tragen.
"use strict";

(function () {
  const list = document.querySelector("[data-filter-list]");
  if (!list) return;

  const items = [...list.children];
  const catButtons = [...document.querySelectorAll("[data-filter-kategorie]")];
  const tagButtons = [...document.querySelectorAll("[data-filter-tag]")];
  const search = document.querySelector("[data-filter-search]");
  const status = document.querySelector("[data-filter-status]");
  const empty = document.querySelector("[data-filter-empty]");

  const state = { kategorie: "alle", tags: new Set(), text: "" };

  // Umlaute und Bindestriche angleichen, damit «Senso ji» auch «Senso-ji» findet.
  const normalize = (value) =>
    value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[-–·]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  const index = items.map((el) => ({
    el,
    kategorie: el.dataset.kategorie || "",
    tags: new Set((el.dataset.tags || "").split(" ").filter(Boolean)),
    text: normalize(`${el.dataset.suche || ""} ${el.textContent}`),
  }));

  function apply() {
    const words = normalize(state.text).split(" ").filter(Boolean);
    let shown = 0;
    for (const item of index) {
      const matchCat = state.kategorie === "alle" || item.kategorie === state.kategorie;
      const matchTags = [...state.tags].every((t) => item.tags.has(t));
      const matchText = words.every((w) => item.text.includes(w));
      const visible = matchCat && matchTags && matchText;
      item.el.hidden = !visible;
      if (visible) shown++;
    }
    if (status) status.textContent = `${shown} von ${index.length} ${status.dataset.filterNoun || "Orten"}`;
    if (empty) empty.hidden = shown > 0;
  }

  catButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      state.kategorie = btn.dataset.filterKategorie;
      catButtons.forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
      apply();
    });
  });

  tagButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const tag = btn.dataset.filterTag;
      const on = !state.tags.has(tag);
      if (on) state.tags.add(tag);
      else state.tags.delete(tag);
      btn.setAttribute("aria-pressed", String(on));
      apply();
    });
  });

  search?.addEventListener("input", () => {
    state.text = search.value.slice(0, 60);
    apply();
  });

  document.querySelector("[data-filter-reset]")?.addEventListener("click", () => {
    state.kategorie = "alle";
    state.tags.clear();
    state.text = "";
    if (search) search.value = "";
    catButtons.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.filterKategorie === "alle")));
    tagButtons.forEach((b) => b.setAttribute("aria-pressed", "false"));
    apply();
    catButtons[0]?.focus();
  });

  apply();
})();
