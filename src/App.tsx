import { useMemo, useState } from "react";
import Fretboard from "./components/fretboard/Fretboard";

type Screen = "lobby" | "practice";
type PracticeMode = "circle" | "interval" | null;

function App() {
  const [screen, setScreen] = useState<Screen>("lobby");
  const [practiceMode, setPracticeMode] = useState<PracticeMode>(null);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [targetNote, setTargetNote] = useState("C");

  const enterPractice = (mode: Exclude<PracticeMode, null>) => {
    setPracticeMode(mode);
    setScore(0);
    setCombo(0);
    setIsTransitioning(false);
    setTargetNote("C");
    setScreen("practice");
  };

  const backToLobby = () => {
    setScreen("lobby");
    setPracticeMode(null);
    setScore(0);
    setCombo(0);
    setIsTransitioning(false);
    setTargetNote("C");
  };

  const modeTitle = useMemo(() => {
    if (practiceMode === "circle") return "四/五度圈";
    if (practiceMode === "interval") return "音程特训";
    return "";
  }, [practiceMode]);

  return (
    <div className="h-screen w-full bg-zinc-950 text-zinc-50 overflow-hidden flex items-center justify-center p-4">
      <main className="w-full max-w-6xl flex flex-col gap-y-8 md:gap-y-16">
        {screen === "lobby" ? (
          <section className="w-full flex items-center justify-center">
            <div className="w-full max-w-md rounded-2xl bg-zinc-900/70 border border-zinc-700 p-6 shadow-xl">
              <h1 className="text-center text-2xl font-semibold tracking-wide mb-6">
                Absolute Fret
              </h1>
              <div className="flex flex-col gap-4">
                <button
                  type="button"
                  className="w-full rounded-xl bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 border border-zinc-600 py-4 text-lg font-medium transition"
                  onClick={() => enterPractice("circle")}
                >
                  四 / 五度圈
                </button>
                <button
                  type="button"
                  className="w-full rounded-xl bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 border border-zinc-600 py-4 text-lg font-medium transition"
                  onClick={() => enterPractice("interval")}
                >
                  音程特训
                </button>
              </div>
            </div>
          </section>
        ) : (
          <section className="w-full flex flex-col gap-y-8 md:gap-y-16">
            <header className="relative w-full flex items-center justify-between">
              <button
                type="button"
                className="rounded-lg px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 transition z-10"
                onClick={backToLobby}
              >
                返回大厅
              </button>

              <div className="text-right text-sm text-zinc-300 z-10">
                <div>Score: {score}</div>
                <div>Combo: {combo}</div>
              </div>

              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none">
                <h2 className="text-6xl font-bold tracking-wide">{targetNote}</h2>
                <p className="text-center text-xs text-zinc-500 mt-2">{modeTitle}</p>
                <p className="text-center text-xs text-zinc-500">
                  isTransitioning: {String(isTransitioning)}
                </p>
              </div>
            </header>

            <div className="w-full relative aspect-[100/34]">
              <Fretboard />
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;