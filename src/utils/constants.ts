export const FRET_WIDTH_RATIOS = [
  0.33, 1.0, 0.99, 0.97, 0.96, 0.95, 0.94, 0.92, 0.91, 0.9, 0.89, 0.87, 0.86,
  0.85,
] as const;

export const CHROMATIC_SCALE = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
] as const;

export const currentTuning = [
  { note: "E", octave: 2 },
  { note: "A", octave: 2 },
  { note: "D", octave: 3 },
  { note: "G", octave: 3 },
  { note: "B", octave: 3 },
  { note: "E", octave: 4 },
] as const;
