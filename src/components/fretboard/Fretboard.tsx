import { useMemo } from "react";
import Fret from "./Fret";
import StringLine from "./String";
import { FRET_WIDTH_RATIOS } from "../../utils/constants";
import type { BoardPosition } from "../../hooks/useGameLogic";

type FretboardProps = {
  onFretClick: (stringIndex: number, fretIndex: number) => void;
  isTransitioning: boolean;
  activeFeedbackCell: (BoardPosition & { state: "correct" | "wrong" }) | null;
  hintAnswers: BoardPosition[];
  lockedCorrectAnswers: BoardPosition[];
  highlightedFret?: BoardPosition | null;
  activeStrings: number[];
};

function Fretboard({
  onFretClick,
  isTransitioning,
  activeFeedbackCell,
  hintAnswers,
  lockedCorrectAnswers,
  highlightedFret,
  activeStrings,
}: FretboardProps) {
  const hintKeySet = useMemo(() => new Set(hintAnswers.map((pos) => `${pos.stringIndex}-${pos.fretIndex}`)), [hintAnswers]);
  const lockedCorrectKeySet = useMemo(
    () => new Set(lockedCorrectAnswers.map((pos) => `${pos.stringIndex}-${pos.fretIndex}`)),
    [lockedCorrectAnswers],
  );
  const highlightedKeySet = useMemo(() => {
    if (!highlightedFret) return new Set<string>();
    return new Set([`${highlightedFret.stringIndex}-${highlightedFret.fretIndex}`]);
  }, [highlightedFret]);

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden border border-zinc-700/80 bg-[#3E2723]">
      <div className="absolute inset-0 flex">
        {FRET_WIDTH_RATIOS.map((ratio, index) => (
          <Fret
            key={`fret-${index}`}
            fretIndex={index}
            widthRatio={ratio}
            onFretClick={onFretClick}
            isTransitioning={isTransitioning}
            activeFeedbackCell={activeFeedbackCell}
            hintKeySet={hintKeySet}
            lockedCorrectKeySet={lockedCorrectKeySet}
            highlightedKeySet={highlightedKeySet}
            activeStrings={activeStrings}
          />
        ))}
      </div>

      <div className="absolute inset-0 flex flex-col justify-around py-4 pointer-events-none z-10">
        {Array.from({ length: 6 }, (_, idx) => (
          <StringLine key={`string-line-${idx}`} stringIndex={idx} activeStrings={activeStrings} />
        ))}
      </div>
    </div>
  );
}

export default Fretboard;
