import { useMemo, useState } from "react";
import Fretboard from "./components/fretboard/Fretboard";
import QuestionDisplay from "./components/ui/QuestionDisplay";
import { useGameLogic, type PracticeMode as GamePracticeMode } from "./hooks/useGameLogic";

type Screen = "lobby" | "practice";
type PracticeMode = "circle" | "interval" | null;

type PracticeSessionProps = {
  mode: GamePracticeMode;
  onBack: () => void;
};

function PracticeSession({ mode, onBack }: PracticeSessionProps) {
  const { score, combo, isTransitioning, questionText, questionFeedback, activeFeedbackCell, hintAnswers, handleFretClick } =
    useGameLogic(mode);

  const modeTitle = useMemo(() => {
    if (mode === "circle") return "四/五度圈";
    return "音程特训";
  }, [mode]);

  return (
    <section className="w-full flex flex-col gap-y-8 md:gap-y-16">
      <header className="relative w-full flex items-center justify-between">
        <button
          type="button"
          className="rounded-lg px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 transition z-10"
          onClick={onBack}
        >
          返回大厅
        </button>

        <div className="text-right text-sm text-zinc-300 z-10">
          <div>Score: {score}</div>
          <div>Combo: {combo}</div>
        </div>

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none">
          <QuestionDisplay key={questionText} questionText={questionText} modeTitle={modeTitle} feedback={questionFeedback} />
        </div>
      </header>

      <div className="w-full relative aspect-[100/34]">
        <Fretboard
          onFretClick={handleFretClick}
          isTransitioning={isTransitioning}
          activeFeedbackCell={activeFeedbackCell}
          hintAnswers={hintAnswers}
        />
      </div>
    </section>
  );
}

function App() {
  const [screen, setScreen] = useState<Screen>("lobby");
  const [practiceMode, setPracticeMode] = useState<PracticeMode>(null);

  const enterPractice = (mode: Exclude<PracticeMode, null>) => {
    setPracticeMode(mode);
    setScreen("practice");
  };

  const backToLobby = () => {
    setScreen("lobby");
    setPracticeMode(null);
  };

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
        ) : practiceMode ? (
          <PracticeSession mode={practiceMode} onBack={backToLobby} />
        ) : null}
      </main>
    </div>
  );
}

export default App;