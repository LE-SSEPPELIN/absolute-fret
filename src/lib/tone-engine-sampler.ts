import * as Tone from "tone";

let sampler: Tone.Sampler | null = null;
let initialized = false;

const SAMPLER_BASE_URL = "/samples/";
const SAMPLER_URLS: Record<string, string> = {
  E2: "guitar_E2.mp3",
  A2: "guitar_A2.mp3",
  C3: "guitar_C3.mp3",
  D3: "guitar_D3.mp3",
  F3: "guitar_F3.mp3",
  G3: "guitar_G3.mp3",
  B3: "guitar_B3.mp3",
  E4: "guitar_E4.mp3",
  D4: "guitar_D4.mp3",
  A4: "guitar_A4.mp3",
};

function createSampler(): Tone.Sampler {
  return new Tone.Sampler({
    urls: SAMPLER_URLS,
    baseUrl: SAMPLER_BASE_URL,
    release: 1.0,
  }).toDestination();
}

export function ensureToneEngine(): void {
  if (initialized) {
    return;
  }

  try {
    sampler = createSampler();
    initialized = true;
  } catch {
    sampler = null;
    initialized = false;
  }
}

export function playGuitarNote(toneParam: string): void {
  if (!initialized) {
    ensureToneEngine();
  }

  if (!sampler) {
    return;
  }

  try {
    if (!sampler.loaded) {
      return;
    }
    sampler.triggerAttackRelease(toneParam, "8n");
  } catch {
    // Keep audio failures from breaking gameplay flow.
  }
}

export function disposeToneEngine(): void {
  if (!initialized) {
    return;
  }

  try {
    sampler?.dispose();
  } catch {
    // No-op on dispose failures.
  } finally {
    sampler = null;
    initialized = false;
  }
}
