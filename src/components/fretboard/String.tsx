import { memo } from "react";

function StringLine() {
  return <div className="w-full h-[2px] bg-zinc-400 shadow-sm pointer-events-none" />;
}

export default memo(StringLine);
