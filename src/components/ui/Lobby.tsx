import { useMemo } from "react";

type LobbyProps = {
  onSelectMode: (mode: "circle" | "interval") => void;
};

function Lobby({ onSelectMode }: LobbyProps) {
  const modeTitle = useMemo(() => {
    return "吉他指板绝对音感与音程特训";
  }, []);

  return (
    <section className="w-full flex flex-col items-center justify-center min-h-screen gap-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-bold tracking-widest">Absolute Fret</h1>
        <p className="text-zinc-400 text-lg">{modeTitle}</p>
      </div>

      <div className="w-full max-w-md space-y-4">
        <button
          type="button"
          className="w-full rounded-xl bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 border border-zinc-600 py-4 text-lg font-medium transition"
          onClick={() => onSelectMode("circle")}
        >
          四 / 五度圈特训
        </button>
        <button
          type="button"
          className="w-full rounded-xl bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 border border-zinc-600 py-4 text-lg font-medium transition"
          onClick={() => onSelectMode("interval")}
        >
          音程特训
        </button>
      </div>
    </section>
  );
}

export default Lobby;
