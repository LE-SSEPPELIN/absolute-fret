import * as Tone from "tone";
import { useCallback, useEffect } from "react";
import { disposeToneEngine, playGuitarNote } from "../lib/tone-engine";

export function useAudio() {
  const playNote = useCallback(async (scientificPitch: string) => {
    await Tone.start();
    playGuitarNote(scientificPitch);
  }, []);

  useEffect(() => {
    return () => {
      disposeToneEngine();
    };
  }, []);

  return { playNote };
}
