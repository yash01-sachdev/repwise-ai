let lastSpokenTime = 0;
const COOLDOWN_MS = 1500;

export function speak(message, priority = "normal") {
  const now = Date.now();

  if (priority !== "high") {
    if (now - lastSpokenTime < COOLDOWN_MS) return;
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(message);
  utterance.rate = 1.3;
  utterance.pitch = 1.0;
  utterance.volume = 1.0;
  window.speechSynthesis.speak(utterance);
  lastSpokenTime = now;
}

export function speakRep(message) {
  // Rep numbers always fire — no cooldown
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(message);
  utterance.rate = 1.3;
  utterance.volume = 1.0;
  window.speechSynthesis.speak(utterance);
  lastSpokenTime = Date.now();
}

export function resetAudio() {
  lastSpokenTime = 0;
  window.speechSynthesis.cancel();
}

export const CUE = {
  repCount:  (n) => `${n}`,
  goodRep:   ()  => "good",
  keepGoing: ()  => "keep going",
  halfway:   ()  => "halfway",
  goodDepth: ()  => "good depth",
  tooDeep:   ()  => "too deep",
  chestUp:   ()  => "chest up",
  kneesOut:  ()  => "knees out",
  heelsDown: ()  => "heels down",
  start:     ()  => "session started",
};

