import { CHROMATIC_SCALE, currentTuning } from "./constants";

export type NoteAtFret = {
  note: string;
  octave: number;
  toneParam: string;
};

export function getNoteAtFret(stringIndex: number, fretIndex: number): NoteAtFret {
  const tuning = currentTuning[stringIndex];
  const baseNoteIndex = CHROMATIC_SCALE.indexOf(tuning.note);

  if (baseNoteIndex < 0) {
    throw new Error(`Unknown tuning note: ${tuning.note}`);
  }

  const absoluteSemitones = tuning.octave * 12 + baseNoteIndex + fretIndex;
  const targetOctave = Math.floor(absoluteSemitones / 12);
  const targetNote = CHROMATIC_SCALE[absoluteSemitones % 12];

  return {
    note: targetNote,
    octave: targetOctave,
    toneParam: `${targetNote}${targetOctave}`,
  };
}

export function getFretMarkers(): number[] {
  return [3, 5, 7, 9, 12];
}
