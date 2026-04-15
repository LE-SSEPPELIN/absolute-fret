import { useEffect, useState } from "react";
import type { QuestionFeedback } from "../../hooks/useGameLogic";

type QuestionDisplayProps = {
  questionText: string;
  modeTitle: string;
  feedback: QuestionFeedback;
};

const FEEDBACK_CLASS: Record<QuestionFeedback, string> = {
  idle: "text-zinc-50",
  correct: "text-green-400",
  wrong: "text-red-400",
};

function QuestionDisplay({ questionText, modeTitle, feedback }: QuestionDisplayProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const raf = window.requestAnimationFrame(() => setVisible(true));
    return () => window.cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="select-none">
      <h2
        className={`text-6xl md:text-7xl font-bold tracking-wide text-center transition-opacity duration-200 ${
          FEEDBACK_CLASS[feedback]
        } ${visible ? "opacity-100" : "opacity-0"}`}
      >
        {questionText}
      </h2>
      <p className="text-center text-xs text-zinc-500 mt-2">{modeTitle}</p>
    </div>
  );
}

export default QuestionDisplay;
