import { IDENTIFY_NOTE_LABELS } from "../../utils/constants";

type NoteKeyboardProps = {
  onKeyClick: (label: string) => void;
  keyFeedback: { state: "idle" | "correct" | "wrong"; label: string | null };
  hintLabel: string | null;
  wrongCount: number;
};

function NoteKeyboard({ onKeyClick, keyFeedback, hintLabel, wrongCount }: NoteKeyboardProps) {
  return (
    <section className="w-full h-full flex items-center justify-center">
      <div className="w-full grid grid-cols-6 md:grid-cols-12 gap-2">
        {IDENTIFY_NOTE_LABELS.map((label) => {
          const isFeedbackTarget = keyFeedback.label === label;
          const isCorrect = isFeedbackTarget && keyFeedback.state === "correct";
          const isWrong = isFeedbackTarget && keyFeedback.state === "wrong";
          const isHint = wrongCount >= 3 && hintLabel === label && keyFeedback.state !== "correct";

          return (
            <button
              key={label}
              type="button"
              onClick={() => onKeyClick(label)}
              className={`py-3 rounded-lg border transition text-sm md:text-base ${
                isCorrect
                  ? "bg-green-500/30 border-green-400 text-green-100 shadow-[0_0_16px_rgba(74,222,128,0.8)]"
                  : isWrong
                    ? "bg-red-500/35 border-red-400 text-red-100 shadow-[0_0_14px_rgba(239,68,68,0.8)] animate-pulse"
                    : isHint
                      ? "bg-yellow-500/20 border-yellow-400 text-yellow-100 animate-pulse"
                      : "bg-zinc-800 border-zinc-600 text-zinc-200 hover:bg-zinc-700"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default NoteKeyboard;
