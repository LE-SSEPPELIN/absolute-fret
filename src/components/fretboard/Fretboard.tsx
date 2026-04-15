import { useEffect, useState } from "react";
import Fret from "./Fret";
import StringLine from "./String";
import { useAudio } from "../../hooks/useAudio";
import { getNoteAtFret } from "../../utils/musicTheory";
import { FRET_WIDTH_RATIOS } from "../../utils/constants";

type ActiveSegment = {
  fretIndex: number;
  stringIndex: number;
};

function Fretboard() {
  const { playNote } = useAudio();
  const [activeSegment, setActiveSegment] = useState<ActiveSegment | null>(null);

  useEffect(() => {
    if (activeSegment === null) {
      return;
    }

    const timer = window.setTimeout(() => {
      setActiveSegment(null);
    }, 180);

    return () => window.clearTimeout(timer);
  }, [activeSegment]);

  const handleFretClick = (stringIndex: number, fretIndex: number) => {
    const { scientificPitch } = getNoteAtFret(stringIndex, fretIndex);
    void playNote(scientificPitch);
    setActiveSegment({ stringIndex, fretIndex });
  };

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden border border-zinc-700/80 bg-[#3E2723]">
      <div className="absolute inset-0 flex">
        {FRET_WIDTH_RATIOS.map((ratio, index) => (
          <Fret
            key={`fret-${index}`}
            fretIndex={index}
            widthRatio={ratio}
            onFretClick={handleFretClick}
            activeStringIndex={activeSegment?.fretIndex === index ? activeSegment.stringIndex : null}
          />
        ))}
      </div>

      <div className="absolute inset-0 flex flex-col justify-around py-4 pointer-events-none z-10">
        {Array.from({ length: 6 }, (_, idx) => (
          <StringLine key={`string-line-${idx}`} />
        ))}
      </div>
    </div>
  );
}

export default Fretboard;
