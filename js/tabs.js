// Zugängliche Tabs (Reiserouten): Pfeiltasten, Pos1/Ende, roving tabindex, Anker (#tag-1 …) öffnet das passende Tab.
// Ohne JavaScript bleiben alle Panels untereinander sichtbar.
"use strict";

(function () {
  const tablist = document.querySelector("[data-tabs]");
  if (!tablist) return;

  const tabs = [...tablist.querySelectorAll('[role="tab"]')];
  const panels = tabs.map((tab) => document.getElementById(tab.getAttribute("aria-controls")));
  if (!tabs.length || panels.some((panel) => !panel)) {
    console.error("tabs.js: Zu einem Tab fehlt das Panel.");
    return;
  }

  // Panels erst jetzt zu Tab-Panels machen, damit sie ohne JS normale Abschnitte bleiben.
  panels.forEach((panel, i) => {
    panel.setAttribute("role", "tabpanel");
    panel.setAttribute("aria-labelledby", tabs[i].id);
    panel.tabIndex = 0;
  });

  function select(index, { focus = false, updateHash = false } = {}) {
    tabs.forEach((tab, i) => {
      const active = i === index;
      tab.setAttribute("aria-selected", String(active));
      tab.tabIndex = active ? 0 : -1;
      panels[i].hidden = !active;
    });
    if (focus) tabs[index].focus();
    if (updateHash) history.replaceState(null, "", `#${panels[index].id}`);
  }

  function indexFromHash() {
    const id = decodeURIComponent(location.hash.slice(1));
    return panels.findIndex((panel) => panel.id === id);
  }

  tabs.forEach((tab, i) => {
    tab.addEventListener("click", () => select(i, { updateHash: true }));
  });

  tablist.addEventListener("keydown", (event) => {
    const current = tabs.indexOf(document.activeElement);
    if (current < 0) return;
    const last = tabs.length - 1;
    const targets = {
      ArrowRight: current === last ? 0 : current + 1,
      ArrowLeft: current === 0 ? last : current - 1,
      Home: 0,
      End: last,
    };
    if (!(event.key in targets)) return;
    event.preventDefault();
    select(targets[event.key], { focus: true, updateHash: true });
  });

  // Links wie routen.html#tage-3 innerhalb der Seite
  window.addEventListener("hashchange", () => {
    const index = indexFromHash();
    if (index >= 0) {
      select(index);
      tablist.scrollIntoView({ block: "start" });
    }
  });

  const initial = indexFromHash();
  select(initial >= 0 ? initial : 0);
  if (initial >= 0) tablist.scrollIntoView({ block: "start" });
})();
