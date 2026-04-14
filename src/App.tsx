import { useMemo, useState } from "react";
import SafeAreaContainer from "./components/layout/SafeAreaContainer";

type Screen = "lobby" | "practice";
type PracticeMode = "circle" | "interval" | null;

function App() {
  // 全局路由状态：大厅 / 练习
  const [screen, setScreen] = useState<Screen>("lobby");

  // 核心共享数据（先搭骨架，后续阶段再接入题库/判定）
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
    <SafeAreaContainer>
      <main className="w-full h-full flex items-center justify-center px-4">
        {screen === "lobby" ? (
          <section className="w-full max-w-md rounded-2xl bg-zinc-900/70 border border-zinc-700 p-6 shadow-xl">
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
          </section>
        ) : (
          <section className="w-full h-full rounded-xl border border-zinc-700 bg-zinc-900/50 p-4 flex flex-col">
            <header className="flex items-center justify-between mb-4">
              <button
                type="button"
                className="rounded-lg px-3 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 transition"
                onClick={backToLobby}
              >
                返回大厅
              </button>

              <div className="text-right text-sm text-zinc-300">
                <div>Score: {score}</div>
                <div>Combo: {combo}</div>
              </div>
            </header>

            <div className="flex-1 grid place-items-center">
              <div className="text-center">
                <h2 className="text-2xl font-semibold mb-2">{modeTitle}</h2>
                <p className="text-zinc-300">目标音：{targetNote}</p>
                <p className="text-xs text-zinc-500 mt-3">
                  isTransitioning: {String(isTransitioning)}
                </p>
              </div>
            </div>
          </section>
        )}
      </main>
    </SafeAreaContainer>
  );
}

export default App;