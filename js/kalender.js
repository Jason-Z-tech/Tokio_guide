// Kalender: Monate nach Jahreszeit oder Monat filtern und den aktuellen Monat (Tokioter Zeit) markieren.
"use strict";

(function () {
  const list = document.querySelector("[data-months]");
  if (!list) return;

  const months = [...list.querySelectorAll(":scope > li[data-month]")];
  const buttons = [...document.querySelectorAll("[data-month-filter]")];
  const status = document.querySelector("[data-month-status]");

  const SEASON_NAMES = {
    alle: "alle Monate",
    fruehling: "Frühling",
    sommer: "Sommer",
    herbst: "Herbst",
    winter: "Winter",
  };

  function currentTokyoMonth() {
    const parts = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Tokyo", month: "numeric" }).formatToParts(new Date());
    const month = parts.find((part) => part.type === "month");
    return month ? Number(month.value) : new Date().getMonth() + 1;
  }

  function markCurrentMonth() {
    const now = String(currentTokyoMonth());
    for (const item of months) {
      const isNow = item.dataset.month === now;
      item.querySelector(".month")?.classList.toggle("is-now", isNow);
      if (isNow) {
        const title = item.querySelector("h3");
        if (title && !title.querySelector(".visually-hidden")) {
          const hint = document.createElement("span");
          hint.className = "visually-hidden";
          hint.textContent = " (aktueller Monat in Tokio)";
          title.append(hint);
        }
      }
    }
  }

  function matches(item, filter) {
    return filter === "alle" || item.dataset.season === filter || item.id === filter;
  }

  function describe(filter, shown) {
    if (filter in SEASON_NAMES) {
      return filter === "alle" ? `${shown} von ${months.length} Monaten` : `${SEASON_NAMES[filter]}: ${shown} Monate`;
    }
    const month = months.find((item) => item.id === filter);
    const name = month?.querySelector("h3")?.firstChild?.textContent || filter;
    return `Nur ${name}`;
  }

  function apply(filter) {
    let shown = 0;
    for (const item of months) {
      const visible = matches(item, filter);
      item.hidden = !visible;
      if (visible) shown++;
    }
    buttons.forEach((btn) => btn.setAttribute("aria-pressed", String(btn.dataset.monthFilter === filter)));
    if (status) status.textContent = describe(filter, shown);
  }

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => apply(btn.dataset.monthFilter));
  });

  markCurrentMonth();
  apply("alle");
})();
