// Gemeinsame Funktionen für alle Seiten: Linienplan-Menü, Hell/Dunkel, Stempelheft, Uhr.
"use strict";

const store = {
  get(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch (e) {
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      return false;
    }
  },
  remove(key) {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      /* nichts zu tun */
    }
  },
};
window.tokioStore = store;

function initRouteMap() {
  const dialog = document.getElementById("linienplan");
  const openBtn = document.querySelector("[data-open-map]");
  if (!dialog || !openBtn || typeof dialog.showModal !== "function") return;

  openBtn.addEventListener("click", () => {
    dialog.showModal();
    openBtn.setAttribute("aria-expanded", "true");
  });
  dialog.addEventListener("close", () => {
    openBtn.setAttribute("aria-expanded", "false");
    openBtn.focus();
  });
  dialog.querySelector("[data-close-map]")?.addEventListener("click", () => dialog.close());
  // Klick auf den abgedunkelten Hintergrund schliesst den Plan.
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
}

function currentTheme() {
  const set = document.documentElement.getAttribute("data-theme");
  if (set) return set;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function initThemeToggle() {
  const btn = document.querySelector("[data-theme-toggle]");
  if (!btn) return;
  const label = btn.querySelector(".visually-hidden");
  const update = () => {
    const dark = currentTheme() === "dark";
    btn.setAttribute("aria-pressed", String(dark));
    if (label) label.textContent = dark ? "Helles Design einschalten" : "Dunkles Design einschalten";
  };
  btn.addEventListener("click", () => {
    const next = currentTheme() === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("tokio-theme", next);
    } catch (e) {
      /* Wahl gilt dann nur bis zum Neuladen */
    }
    update();
  });
  update();
}

/* ---------- Stempelheft ---------- */
const STAMP_KEY = "tokio-stempel";

function getStamps() {
  const list = store.get(STAMP_KEY, []);
  return Array.isArray(list) ? list.filter((id) => typeof id === "string") : [];
}

function renderStamps() {
  const stamps = new Set(getStamps());
  document.querySelectorAll("[data-stamp]").forEach((btn) => {
    const on = stamps.has(btn.dataset.stamp);
    btn.setAttribute("aria-pressed", String(on));
    const text = btn.querySelector(".stamp-btn__text");
    if (text) text.textContent = on ? "Gestempelt" : "Stempeln";
  });
  document.querySelectorAll("[data-stamp-slot]").forEach((slot) => {
    const on = stamps.has(slot.dataset.stampSlot);
    slot.classList.toggle("is-stamped", on);
    const state = slot.querySelector(".visually-hidden");
    if (state) state.textContent = on ? " (gestempelt)" : " (noch offen)";
  });
  const total = document.querySelectorAll("[data-stamp-slot]").length;
  const count = [...stamps].filter((id) => document.querySelector(`[data-stamp-slot="${CSS.escape(id)}"]`)).length;
  document.querySelectorAll("[data-stamp-count]").forEach((el) => {
    el.textContent = `${count} / ${total}`;
  });
  document.querySelectorAll("[data-stamp-bar]").forEach((bar) => {
    bar.style.width = total ? `${(count / total) * 100}%` : "0";
  });
}

function initStamps() {
  if (!document.querySelector("[data-stamp], [data-stamp-slot]")) return;
  document.querySelectorAll("[data-stamp]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.stamp;
      const stamps = new Set(getStamps());
      if (stamps.has(id)) stamps.delete(id);
      else stamps.add(id);
      store.set(STAMP_KEY, [...stamps]);
      renderStamps();
    });
  });
  document.querySelector("[data-stamp-reset]")?.addEventListener("click", () => {
    if (window.confirm("Alle Stempel löschen?")) {
      store.remove(STAMP_KEY);
      renderStamps();
    }
  });
  renderStamps();
}

/* ---------- Uhr der Abfahrtstafel (Tokioter Zeit) ---------- */
function initClock() {
  const el = document.querySelector("[data-tokyo-clock]");
  if (!el) return;
  const fmt = new Intl.DateTimeFormat("de-CH", {
    timeZone: "Asia/Tokyo",
    hour: "2-digit",
    minute: "2-digit",
  });
  const tick = () => {
    el.textContent = `${fmt.format(new Date())} Uhr in Tokio`;
  };
  tick();
  setInterval(tick, 30000);
}

initRouteMap();
initThemeToggle();
initStamps();
initClock();
