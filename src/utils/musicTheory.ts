import { CHROMATIC_SCALE, currentTuning } from "./constants";

export type NoteAtFret = {
  note: string;
  octave: number;
  scientificPitch: string;
};

export function getNoteAtFret(stringIndex: number, fretIndex: number): NoteAtFret {
  const openString = currentTuning[stringIndex];
  const startIndex = CHROMATIC_SCALE.indexOf(openString.note);

  if (startIndex < 0) {
    throw new Error(`Unknown tuning note: ${openString.note}`);
  }

  const chromaticIndex = (startIndex + fretIndex) % CHROMATIC_SCALE.length;
  const octaveOffset = Math.floor((startIndex + fretIndex) / CHROMATIC_SCALE.length);
  const note = CHROMATIC_SCALE[chromaticIndex];
  const octave = openString.octave + octaveOffset;

  return {
    note,
    octave,
    scientificPitch: `${note}${octave}`,
  };
}

export function getFretMarkers(): number[] {
  return [3, 5, 7, 9, 12];
}
