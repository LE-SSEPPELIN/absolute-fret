import { useEffect, useState } from "react";
import type { QuestionFeedback } from "../../hooks/useGameLogic";

type QuestionDisplayProps = {
  questionText: string;
  modeTitle: string;
  feedback: QuestionFeedback;
  isListenMode?: boolean;
  onReplayAudio?: () => void;
};

const FEEDBACK_CLASS: Record<QuestionFeedback, string> = {
  idle: "text-zinc-50",
  correct: "text-green-400",
  wrong: "text-red-400",
};

function QuestionDisplay({ questionText, modeTitle, feedback, isListenMode = false, onReplayAudio }: QuestionDisplayProps) {
  const [visible, setVisible] = useState(false);
  const [isReplaying, setIsReplaying] = useState(false);

  useEffect(() => {
    const raf = window.requestAnimationFrame(() => setVisible(true));
    return () => window.cancelAnimationFrame(raf);
  }, []);

  const handleReplay = () => {
    if (!onReplayAudio) return;
    onReplayAudio();
    setIsReplaying(true);
    window.setTimeout(() => setIsReplaying(false), 220);
  };

  return (
    <div className="select-none">
      {isListenMode ? (
        <button
          type="button"
          onClick={handleReplay}
          className={`relative mx-auto block p-3 rounded-full border border-zinc-500/70 hover:border-zinc-300 transition ${
            isReplaying ? "shadow-[0_0_18px_rgba(56,189,248,0.8)]" : ""
          }`}
          aria-label="重播当前音符"
        >
          <span className={`absolute inset-0 rounded-full ${isReplaying ? "animate-ping bg-sky-400/25" : ""}`} />
          <svg viewBox="0 0 24 24" className="relative w-10 h-10 text-zinc-100 fill-current">
            <path d="M3 10v4h4l5 4V6L7 10H3zm13.5 2a4.5 4.5 0 00-2.5-4.03v8.06A4.5 4.5 0 0016.5 12zm0-8.5v2.06a7 7 0 010 12.88v2.06a9 9 0 000-17z" />
          </svg>
        </button>
      ) : (
        <h2
          className={`text-4xl md:text-5xl font-bold tracking-wide text-center transition-opacity duration-200 whitespace-nowrap ${
            FEEDBACK_CLASS[feedback]
          } ${visible ? "opacity-100" : "opacity-0"}`}
        >
          {questionText}
        </h2>
      )}
      <p className="text-center text-base font-medium text-zinc-400 mt-2">{modeTitle}</p>
    </div>
  );
}

export default QuestionDisplay;
