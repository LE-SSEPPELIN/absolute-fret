import { memo } from "react";
import FretMarker from "./FretMarker";
import { getFretMarkers, getNoteAtFret } from "../../utils/musicTheory";

type FretProps = {
  fretIndex: number;
  widthRatio: number;
  onFretClick: (stringIndex: number, fretIndex: number) => void;
};

const MARKER_FRETS = getFretMarkers();

function Fret({ fretIndex, widthRatio, onFretClick }: FretProps) {
  const hasMarker = MARKER_FRETS.includes(fretIndex);
  const isDouble = fretIndex === 12;

  return (
    <div
      className={`relative h-full ${fretIndex === 0 ? "bg-zinc-700/60 border-r-[3px] border-zinc-300/90" : "bg-[#3E2723] border-r-[3px] border-zinc-400/80"}`}
      style={{ flex: widthRatio }}
    >
      <div className="h-full w-full flex flex-col">
        {Array.from({ length: 6 }, (_, stringIndex) => {
          const noteInfo = getNoteAtFret(stringIndex, fretIndex);
          return (
            <button
              key={`${stringIndex}-${fretIndex}`}
              type="button"
              className="flex-1 w-full bg-transparent"
              onClick={() => {
                console.log(`Clicked: ${stringIndex + 1}弦 - ${fretIndex}品`);
                console.log(`Pitch: ${noteInfo.scientificPitch}`);
                onFretClick(stringIndex, fretIndex);
              }}
              aria-label={`${stringIndex + 1}弦 ${fretIndex}品`}
            />
          );
        })}
      </div>
      {hasMarker ? <FretMarker isDouble={isDouble} /> : null}
    </div>
  );
}

export default memo(Fret);
