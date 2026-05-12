import { memo } from "react";
import FretMarker from "./FretMarker";
import { getFretMarkers } from "../../utils/musicTheory";

type FretProps = {
  fretIndex: number;
  widthRatio: number;
  onFretClick: (stringIndex: number, fretIndex: number) => void;
  isTransitioning: boolean;
  activeFeedbackCell: { stringIndex: number; fretIndex: number; state: "correct" | "wrong" } | null;
  hintKeySet: Set<string>;
  lockedCorrectKeySet: Set<string>;
  activeStrings: number[];
};

const MARKER_FRETS = getFretMarkers();

function Fret({
  fretIndex,
  widthRatio,
  onFretClick,
  isTransitioning,
  activeFeedbackCell,
  hintKeySet,
  lockedCorrectKeySet,
  activeStrings,
}: FretProps) {
  const hasMarker = MARKER_FRETS.includes(fretIndex);
  const isDouble = fretIndex === 12;

  return (
    <div
      className={`relative h-full ${
        fretIndex === 0 ? "bg-zinc-700/60 border-r-[3px] border-zinc-300/90" : "bg-[#3E2723] border-r-[3px] border-zinc-400/80"
      }`}
      style={{ flex: widthRatio }}
    >
      <div className="absolute inset-0 flex flex-col justify-around py-4">
        {Array.from({ length: 6 }, (_, stringIndex) => {
          const isStringActive = activeStrings.includes(stringIndex);
          const cellKey = `${stringIndex}-${fretIndex}`;
          const isActiveFeedback = activeFeedbackCell?.stringIndex === stringIndex && activeFeedbackCell?.fretIndex === fretIndex;
          const glowState = isActiveFeedback
            ? activeFeedbackCell.state
            : lockedCorrectKeySet.has(cellKey)
              ? "correct"
              : hintKeySet.has(cellKey)
                ? "hint"
                : "idle";

          const glowClass =
            glowState === "correct"
              ? "bg-green-400/30 shadow-[0_0_20px_rgba(74,222,128,0.8)]"
              : glowState === "wrong"
                ? "bg-red-500/40 shadow-[0_0_20px_rgba(239,68,68,0.8)]"
                : glowState === "hint"
                  ? "bg-yellow-400/20 shadow-[0_0_15px_rgba(250,204,21,0.5)] animate-pulse"
                  : "bg-white/20 shadow-[0_0_20px_rgba(255,255,255,0.7)]";

          return (
            <div key={`${stringIndex}-${fretIndex}`} className="relative w-full h-8">
              <button
                type="button"
                className={`absolute inset-0 w-full h-full bg-transparent ${isStringActive ? "cursor-pointer" : "cursor-default"}`}
                disabled={isTransitioning || !isStringActive}
                onClick={() => {
                  if (!isStringActive) {
                    return;
                  }
                  onFretClick(stringIndex, fretIndex);
                }}
                aria-label={`${stringIndex + 1}弦 ${fretIndex}品`}
              />
              {glowState !== "idle" ? (
                <div
                  className={`absolute left-0 top-1/2 -translate-y-1/2 w-full h-[8px] rounded-full pointer-events-none ${glowClass}`}
                />
              ) : null}
            </div>
          );
        })}
      </div>
      {hasMarker ? <FretMarker isDouble={isDouble} /> : null}
    </div>
  );
}

export default memo(Fret);
