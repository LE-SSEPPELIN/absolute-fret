import { memo } from "react";

type StringLineProps = {
  stringIndex: number;
  activeStrings: number[];
};

function StringLine({ stringIndex, activeStrings }: StringLineProps) {
  const isActive = activeStrings.includes(stringIndex);
  return (
    <div
      className={`w-full h-[2px] bg-zinc-400 shadow-sm pointer-events-none transition-opacity ${
        isActive ? "opacity-90" : "opacity-20"
      }`}
    />
  );
}

export default memo(StringLine);
