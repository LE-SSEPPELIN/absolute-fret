import { useEffect, useState } from "react";
import Fret from "./Fret";
import StringLine from "./String";
import { FRET_WIDTH_RATIOS } from "../../utils/constants";

function Fretboard() {
  const [activeStringIndex, setActiveStringIndex] = useState<number | null>(null);

  useEffect(() => {
    if (activeStringIndex === null) {
      return;
    }

    const timer = window.setTimeout(() => {
      setActiveStringIndex(null);
    }, 180);

    return () => window.clearTimeout(timer);
  }, [activeStringIndex]);

  const handleFretClick = (stringIndex: number) => {
    setActiveStringIndex(stringIndex);
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
          />
        ))}
      </div>

      <div className="absolute inset-0 flex flex-col justify-around py-4 pointer-events-none z-10">
        {Array.from({ length: 6 }, (_, idx) => (
          <StringLine key={`string-line-${idx}`} isActive={idx === activeStringIndex} />
        ))}
      </div>
    </div>
  );
}

export default Fretboard;
