import { memo } from "react";

type StringLineProps = {
  isActive: boolean;
};

function StringLine({ isActive }: StringLineProps) {
  return (
    <div
      className={`w-full pointer-events-none transition-all duration-150 ${
        isActive
          ? "shadow-xl shadow-zinc-200/60 opacity-100 h-[3px] bg-zinc-100"
          : "h-[2px] bg-zinc-400 shadow-sm opacity-90"
      }`}
    />
  );
}

export default memo(StringLine);
