export const FRET_WIDTH_RATIOS = [0.6, 1.0, 0.99, 0.98, 0.97, 0.96, 0.95, 0.94, 0.93, 0.92, 0.91, 0.9, 0.89, 0.88] as const;

export const CHROMATIC_SCALE = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"] as const;

export const currentTuning = [
  { note: "E", octave: 4 },
  { note: "B", octave: 3 },
  { note: "G", octave: 3 },
  { note: "D", octave: 3 },
  { note: "A", octave: 2 },
  { note: "E", octave: 2 },
] as const;

export const FRET_RANGE_OPTIONS = [
  { id: "open_0_3", label: "开放 (0-3品)", shortLabel: "0-3品", minFret: 0, maxFret: 3 },
  { id: "low_3_7", label: "低位 (3-7品)", shortLabel: "3-7品", minFret: 3, maxFret: 7 },
  { id: "mid_7_10", label: "中位 (7-10品)", shortLabel: "7-10品", minFret: 7, maxFret: 10 },
  { id: "high_10_13", label: "高位 (10-13品)", shortLabel: "10-13品", minFret: 10, maxFret: 13 },
] as const;

export const CHORD_FORMULAS = [
  { id: "maj", name: "Maj", semitones: [0, 4, 7] },
  { id: "min", name: "min", semitones: [0, 3, 7] },
  { id: "dim", name: "dim", semitones: [0, 3, 6] },
  { id: "aug", name: "aug", semitones: [0, 4, 8] },
  { id: "sus2", name: "sus2", semitones: [0, 2, 7] },
  { id: "sus4", name: "sus4", semitones: [0, 5, 7] },
  { id: "maj7", name: "Maj7", semitones: [0, 4, 7, 11] },
  { id: "dom7", name: "Dom7", semitones: [0, 4, 7, 10] },
] as const;
