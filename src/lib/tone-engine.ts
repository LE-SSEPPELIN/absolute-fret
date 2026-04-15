import * as Tone from "tone";

let synth: Tone.PolySynth<Tone.FMSynth> | null = null;
let chorus: Tone.Chorus | null = null;
let busVolume: Tone.Volume | null = null;
let reverb: Tone.Reverb | null = null;
let initialized = false;

function kickOffReverbBackgroundLoad(target: Tone.Reverb): void {
  void target.ready.catch(() => undefined);
}

export function ensureToneEngine(): void {
  if (initialized) {
    return;
  }

  synth = new Tone.PolySynth(Tone.FMSynth, {
    harmonicity: 3.5,
    modulationIndex: 20,
    oscillator: { type: "sine" },
    envelope: {
      attack: 0.001,
      decay: 1.0,
      sustain: 0.8,
      release: 4.0,
    },
    modulation: { type: "square" },
    modulationEnvelope: {
      attack: 0.001,
      decay: 0.1,
      sustain: 0,
      release: 0.1,
    },
  });

  chorus = new Tone.Chorus(4, 2.5, 0.5).start();
  busVolume = new Tone.Volume(-8);
  reverb = new Tone.Reverb({
    decay: 2.5,
    wet: 0.35,
  });

  synth.connect(chorus);
  chorus.connect(busVolume);
  busVolume.connect(reverb);
  reverb.connect(Tone.Destination);
  kickOffReverbBackgroundLoad(reverb);

  initialized = true;
}

export function playGuitarNote(toneParam: string): void {
  if (!initialized) {
    ensureToneEngine();
  }

  synth?.triggerAttackRelease(toneParam, "8n");
}

export function disposeToneEngine(): void {
  if (!initialized) {
    return;
  }

  synth?.dispose();
  synth = null;

  chorus?.dispose();
  chorus = null;

  busVolume?.dispose();
  busVolume = null;

  reverb?.dispose();
  reverb = null;

  initialized = false;
}
