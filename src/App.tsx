import { useMemo, useState } from "react";
import Fretboard from "./components/fretboard/Fretboard";
import QuestionDisplay from "./components/ui/QuestionDisplay";
import Lobby from "./components/ui/Lobby";
import ConfigPanel from "./components/ui/ConfigPanel";
import NoteKeyboard from "./components/ui/NoteKeyboard";
import ResultModal from "./components/ui/ResultModal";
import { FRET_RANGE_OPTIONS } from "./utils/constants";
import { useGameLogic, type PracticeMode as GamePracticeMode, type GameConfig } from "./hooks/useGameLogic";

type PracticeMode = "circle" | "interval" | "randomNote" | "arpeggio" | "identifyByPosition" | "listenAndLocate" | null;

type PracticeSessionProps = {
  mode: GamePracticeMode;
  config: GameConfig;
  onBack: () => void;
};

const MODE_LABELS: Record<GamePracticeMode, string> = {
  circle: "四/五度圈",
  interval: "音程练习",
  randomNote: "随机音寻找",
  arpeggio: "琶音练习",
  identifyByPosition: "看位识音",
  listenAndLocate: "听音辨位",
};

function buildFretRangeDescription(selectedRangeIds: string[]): string {
  const orderedRanges = FRET_RANGE_OPTIONS.filter((item) => selectedRangeIds.includes(item.id));
  if (orderedRanges.length === 0 || orderedRanges.length === FRET_RANGE_OPTIONS.length) return "全指板";
  return orderedRanges.map((item) => item.shortLabel).join(", ");
}

function PracticeSession({ mode, config, onBack }: PracticeSessionProps) {
  const {
    score,
    combo,
    isTransitioning,
    questionText,
    questionFeedback,
    activeFeedbackCell,
    hintAnswers,
    lockedCorrectAnswers,
    highlightedFret,
    noteKeyFeedback,
    noteHintLabel,
    identifyWrongCount,
    gameState,
    totalErrors,
    durationSeconds,
    accuracy,
    handleFretClick,
    handleNoteKeyClick,
    replayCurrentQuestionAudio,
    restartGame,
  } = useGameLogic(mode, config);

  const subtitle = useMemo(() => {
    if (mode === "identifyByPosition") return "看位识音 - 坐标模式";
    if (mode === "listenAndLocate") return "听音辨位 - 盲听模式";
    const modeLabel = MODE_LABELS[mode];
    const fretRangeText = mode === "arpeggio" ? buildFretRangeDescription(config.fretRanges) : "全指板";
    return `${modeLabel} - ${fretRangeText}`;
  }, [config.fretRanges, mode]);

  if (mode === "identifyByPosition") {
    return (
      <>
      <section className="w-full h-[calc(100vh-4rem)] max-h-full flex flex-col items-center justify-center gap-6 overflow-hidden">
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
            <QuestionDisplay
              key={questionText}
              questionText={questionText}
              modeTitle={subtitle}
              feedback={questionFeedback}
              isListenMode={false}
              onReplayAudio={replayCurrentQuestionAudio}
            />
          </div>
        </header>

        <div className="w-full flex items-center justify-center mt-10 pointer-events-none">
          <div className="w-full relative aspect-[100/34]">
            <Fretboard
              onFretClick={handleFretClick}
              isTransitioning
              activeFeedbackCell={activeFeedbackCell}
              hintAnswers={hintAnswers}
              lockedCorrectAnswers={lockedCorrectAnswers}
              highlightedFret={highlightedFret}
              activeStrings={config.strings}
            />
          </div>
        </div>

        <div className="w-full flex items-center mt-6">
          <NoteKeyboard onKeyClick={handleNoteKeyClick} keyFeedback={noteKeyFeedback} hintLabel={noteHintLabel} wrongCount={identifyWrongCount} />
        </div>
      </section>
      {gameState === "finished" ? (
        <ResultModal
          totalErrors={totalErrors}
          accuracy={accuracy}
          durationSeconds={durationSeconds}
          onBack={onBack}
          onContinue={restartGame}
        />
      ) : null}
      </>
    );
  }

  return (
    <>
    <section className="w-full h-[calc(100vh-4rem)] max-h-full flex flex-col items-center justify-center gap-6 overflow-hidden">
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
          <QuestionDisplay
            key={questionText}
            questionText={questionText}
            modeTitle={subtitle}
            feedback={questionFeedback}
            isListenMode={mode === "listenAndLocate"}
            onReplayAudio={replayCurrentQuestionAudio}
          />
        </div>
      </header>

      <div className="w-full flex items-center justify-center mt-10">
        <div className="w-full relative aspect-[100/34]">
          <Fretboard
            onFretClick={handleFretClick}
            isTransitioning={isTransitioning}
            activeFeedbackCell={activeFeedbackCell}
            hintAnswers={hintAnswers}
            lockedCorrectAnswers={lockedCorrectAnswers}
            highlightedFret={null}
            activeStrings={config.strings}
          />
        </div>
      </div>
    </section>
    {gameState === "finished" ? (
      <ResultModal
        totalErrors={totalErrors}
        accuracy={accuracy}
        durationSeconds={durationSeconds}
        onBack={onBack}
        onContinue={restartGame}
      />
    ) : null}
    </>
  );
}

function App() {
  const [practiceMode, setPracticeMode] = useState<PracticeMode>(null);
  const [selectedModeForConfig, setSelectedModeForConfig] = useState<PracticeMode>(null);
  const [activeConfig, setActiveConfig] = useState<GameConfig | null>(null);

  const handleSelectMode = (mode: Exclude<PracticeMode, null>) => {
    setSelectedModeForConfig(mode);
  };

  const handleConfigStart = (config: GameConfig) => {
    if (selectedModeForConfig) {
      setActiveConfig(config);
      setPracticeMode(selectedModeForConfig);
      setSelectedModeForConfig(null);
    }
  };

  const backToLobby = () => {
    setPracticeMode(null);
    setSelectedModeForConfig(null);
    setActiveConfig(null);
  };

  return (
    <div className="h-screen w-full bg-zinc-950 text-zinc-50 overflow-hidden flex items-center justify-center p-4">
      <main className="w-full max-w-6xl h-full overflow-hidden">
        {practiceMode === null ? (
          selectedModeForConfig ? (
            <div className="w-full h-full flex items-center justify-center">
              <ConfigPanel mode={selectedModeForConfig} onStart={handleConfigStart} onCancel={() => setSelectedModeForConfig(null)} />
            </div>
          ) : (
            <Lobby onSelectMode={handleSelectMode} />
          )
        ) : activeConfig ? (
          <PracticeSession mode={practiceMode} config={activeConfig} onBack={backToLobby} />
        ) : null}
      </main>
    </div>
  );
}

export default App;
