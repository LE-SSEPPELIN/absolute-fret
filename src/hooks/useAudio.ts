import * as Tone from "tone";
import { useCallback, useEffect } from "react";
import { disposeToneEngine, playGuitarNote } from "../lib/tone-engine-sampler";

export function useAudio() {
  const playNote = useCallback(async (toneParam: string) => {
    await Tone.start();
    playGuitarNote(toneParam);
  }, []);

  useEffect(() => {
    return () => {
      disposeToneEngine();
    };
  }, []);

  return { playNote };
}
