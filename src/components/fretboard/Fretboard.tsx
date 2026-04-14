import Fret from "./Fret";
import StringLine from "./String";
import { FRET_WIDTH_RATIOS } from "../../utils/constants";

function Fretboard() {
  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden border border-zinc-700/80 bg-[#3E2723]">
      <div className="absolute inset-0 flex">
        {FRET_WIDTH_RATIOS.map((ratio, index) => (
          <Fret key={`fret-${index}`} fretIndex={index} widthRatio={ratio} />
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
