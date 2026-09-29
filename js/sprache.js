// Sprach-Spickzettel: «Zeigen» öffnet die Phrase gross im Dialog; «Anhören» nur mit einer lokalen japanischen Stimme.
// Datenschutz: Stimmen mit localService === false schicken den Text an einen Server – die nutzen wir nie.
"use strict";

(function () {
  const phrases = [...document.querySelectorAll("[data-phrase]")];
  if (!phrases.length) return;

  /* ---------- Zeige-Modus ---------- */
  const dialog = document.querySelector("[data-show-dialog]");
  const dialogJp = dialog?.querySelector("[data-show-jp]");
  const dialogDe = dialog?.querySelector("[data-show-de]");
  const showButtons = [...document.querySelectorAll("[data-show]")];
  let opener = null;

  function phraseParts(button) {
    const card = button.closest("[data-phrase]");
    return {
      jp: card.querySelector("[data-phrase-jp]").textContent.trim(),
      de: card.querySelector(".phrase__de").textContent.trim(),
    };
  }

  function initShowDialog() {
    if (!dialog || typeof dialog.showModal !== "function") {
      showButtons.forEach((btn) => (btn.hidden = true));
      return;
    }
    showButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const { jp, de } = phraseParts(btn);
        dialogJp.textContent = jp;
        dialogDe.textContent = de;
        opener = btn;
        dialog.showModal();
      });
    });
    dialog.querySelector("[data-show-close]")?.addEventListener("click", () => dialog.close());
    // Klick neben den Inhalt (auf den Hintergrund) schliesst ebenfalls.
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) dialog.close();
    });
    dialog.addEventListener("close", () => {
      opener?.focus();
      opener = null;
    });
  }

  /* ---------- Anhören ---------- */
  const synth = window.speechSynthesis;
  const speakButtons = [...document.querySelectorAll("[data-speak]")];
  const hint = document.querySelector("[data-voice-hint]");
  const hintText = document.querySelector("[data-voice-hint-text]");
  let voice = null;
  let speakingButton = null;
  let hintTimer = 0;

  function findLocalJapaneseVoice() {
    const local = synth
      .getVoices()
      .filter((v) => v.localService === true && typeof v.lang === "string" && v.lang.toLowerCase().startsWith("ja"));
    return local.find((v) => v.lang.replace("_", "-") === "ja-JP") || local[0] || null;
  }

  function setSpeakAvailable(available) {
    speakButtons.forEach((btn) => (btn.hidden = !available));
    if (hint) hint.hidden = available;
  }

  let currentUtterance = null;

  function stopMarking() {
    speakingButton?.classList.remove("is-speaking");
    speakingButton = null;
    currentUtterance = null;
  }

  function speak(button) {
    const wasSpeaking = button === speakingButton;
    synth.cancel();
    stopMarking();
    if (wasSpeaking || !voice) return; // zweiter Klick stoppt

    const utterance = new SpeechSynthesisUtterance(phraseParts(button).jp);
    utterance.voice = voice;
    utterance.lang = "ja-JP";
    utterance.rate = 0.9;
    utterance.addEventListener("end", () => {
      if (currentUtterance === utterance) stopMarking();
    });
    utterance.addEventListener("error", (event) => {
      if (currentUtterance === utterance) stopMarking();
      // Abbrechen durch einen neuen Klick ist kein Fehler.
      if (event.error !== "interrupted" && event.error !== "canceled") {
        console.error("Sprachausgabe fehlgeschlagen:", event.error);
      }
    });
    currentUtterance = utterance;
    speakingButton = button;
    button.classList.add("is-speaking");
    synth.speak(utterance);
  }

  function checkVoices() {
    voice = findLocalJapaneseVoice();
    if (voice) {
      clearTimeout(hintTimer);
      setSpeakAvailable(true);
    }
    return Boolean(voice);
  }

  function initSpeech() {
    if (!synth || typeof window.SpeechSynthesisUtterance !== "function") {
      if (hintText) hintText.textContent = "Dein Browser kann keinen Text vorlesen.";
      setSpeakAvailable(false);
      return;
    }
    speakButtons.forEach((btn) => btn.addEventListener("click", () => speak(btn)));
    // getVoices() ist anfangs oft leer; die Liste kommt später per «voiceschanged».
    synth.addEventListener("voiceschanged", () => {
      if (!checkVoices()) setSpeakAvailable(false);
    });
    if (!checkVoices()) {
      hintTimer = setTimeout(() => {
        if (!voice) setSpeakAvailable(false);
      }, 1500);
    }
    window.addEventListener("pagehide", () => synth.cancel());
  }

  initShowDialog();
  initSpeech();
})();
