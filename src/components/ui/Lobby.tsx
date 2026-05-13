import { useMemo } from "react";

type LobbyProps = {
  onSelectMode: (mode: "circle" | "interval" | "randomNote" | "arpeggio" | "identifyByPosition" | "listenAndLocate") => void;
};

function Lobby({ onSelectMode }: LobbyProps) {
  const modeTitle = useMemo(() => {
    return "吉他指板绝对音感、音程与和声音训练";
  }, []);

  return (
    <section className="relative w-full flex flex-col items-center justify-center min-h-screen gap-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-bold tracking-widest">Absolute Fret</h1>
        <p className="text-zinc-400 text-lg">{modeTitle}</p>
      </div>

      <div className="w-full max-w-md space-y-4">
        <button type="button" className="w-full rounded-xl bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 border border-zinc-600 py-4 text-lg font-medium transition" onClick={() => onSelectMode("circle")}>四 / 五度圈练习</button>
        <button type="button" className="w-full rounded-xl bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 border border-zinc-600 py-4 text-lg font-medium transition" onClick={() => onSelectMode("interval")}>音程练习</button>
        <button type="button" className="w-full rounded-xl bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 border border-zinc-600 py-4 text-lg font-medium transition" onClick={() => onSelectMode("randomNote")}>随机音寻找</button>
        <button type="button" className="w-full rounded-xl bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 border border-zinc-600 py-4 text-lg font-medium transition" onClick={() => onSelectMode("arpeggio")}>琶音/和弦音</button>
        <button type="button" className="w-full rounded-xl bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 border border-zinc-600 py-4 text-lg font-medium transition" onClick={() => onSelectMode("identifyByPosition")}>看位识音</button>
        <button type="button" className="w-full rounded-xl bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 border border-zinc-600 py-4 text-lg font-medium transition" onClick={() => onSelectMode("listenAndLocate")}>听音辨位</button>
      </div>
      <p className="absolute bottom-10 text-zinc-500 text-lg">特别鸣谢：夏西来</p>
    </section>
  );
}

export default Lobby;
