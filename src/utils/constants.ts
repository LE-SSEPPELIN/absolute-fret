export const FRET_WIDTH_RATIOS = [
  0.6, 1.0, 0.99, 0.98, 0.97, 0.96, 0.95, 0.94, 0.93, 0.92, 0.91, 0.9, 0.89,
  0.88,
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
  { note: "E", octave: 4 }, // 1弦 (最上, 最细)
  { note: "B", octave: 3 }, // 2弦
  { note: "G", octave: 3 }, // 3弦
  { note: "D", octave: 3 }, // 4弦
  { note: "A", octave: 2 }, // 5弦
  { note: "E", octave: 2 }, // 6弦 (最下, 最粗)
] as const;
