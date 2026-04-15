import { memo } from "react";
import FretMarker from "./FretMarker";
import { getFretMarkers } from "../../utils/musicTheory";

type FretProps = {
  fretIndex: number;
  widthRatio: number;
  onFretClick: (stringIndex: number, fretIndex: number) => void;
  activeStringIndex: number | null;
};

const MARKER_FRETS = getFretMarkers();

function Fret({ fretIndex, widthRatio, onFretClick, activeStringIndex }: FretProps) {
  const hasMarker = MARKER_FRETS.includes(fretIndex);
  const isDouble = fretIndex === 12;

  return (
    <div
      className={`relative h-full ${fretIndex === 0 ? "bg-zinc-700/60 border-r-[3px] border-zinc-300/90" : "bg-[#3E2723] border-r-[3px] border-zinc-400/80"}`}
      style={{ flex: widthRatio }}
    >
      <div className="absolute inset-0 flex flex-col justify-around py-4">
        {Array.from({ length: 6 }, (_, stringIndex) => {
          const isActive = activeStringIndex === stringIndex;
          return (
            <div key={`${stringIndex}-${fretIndex}`} className="relative w-full h-8">
              <button
                type="button"
                className="absolute inset-0 w-full h-full bg-transparent"
                onClick={() => {
                  onFretClick(stringIndex, fretIndex);
                }}
                aria-label={`${stringIndex + 1}弦 ${fretIndex}品`}
              />
              {isActive ? (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[6px] bg-white/20 shadow-[0_0_20px_rgba(255,255,255,0.7)] rounded-full pointer-events-none" />
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
