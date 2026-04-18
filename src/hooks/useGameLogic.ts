import { useCallback, useEffect, useRef, useState } from "react";
import { useAudio } from "./useAudio";
import { currentTuning, CHROMATIC_SCALE } from "../utils/constants";
import { getNoteAtFret } from "../utils/musicTheory";

export type PracticeMode = "circle" | "interval";
export type QuestionFeedback = "idle" | "correct" | "wrong";

export type BoardPosition = {
  stringIndex: number;
  fretIndex: number;
};

export type GameConfig = {
  strings: number[];
  modeLength: number | "endless";
  subOptions: string[];
};

type IntervalOption = {
  id: string;
  name: string;
  semitones: number;
};

type QuestionPayload = {
  targetNote: string;
  questionText: string;
  validAnswers: BoardPosition[];
};

const FRET_COUNT = 14;
const ALL_STRINGS = [0, 1, 2, 3, 4, 5];
const DEFAULT_GAME_CONFIG: GameConfig = {
  strings: ALL_STRINGS,
  modeLength: 20,
  subOptions: [],
};
const CIRCLE_OF_FOURTHS = ["C", "F", "A#", "D#", "G#", "C#", "F#", "B", "E", "A", "D", "G"] as const;
const CIRCLE_OF_FIFTHS = ["C", "G", "D", "A", "E", "B", "F#", "C#", "G#", "D#", "A#", "F"] as const;
const INTERVAL_OPTIONS: IntervalOption[] = [
  { id: "m2", name: "小二度", semitones: 1 },
  { id: "M2", name: "大二度", semitones: 2 },
  { id: "m3", name: "小三度", semitones: 3 },
  { id: "M3", name: "大三度", semitones: 4 },
  { id: "P4", name: "纯四度", semitones: 5 },
  { id: "P5", name: "纯五度", semitones: 7 },
  { id: "m6", name: "小六度", semitones: 8 },
  { id: "M6", name: "大六度", semitones: 9 },
  { id: "m7", name: "小七度", semitones: 10 },
  { id: "M7", name: "大七度", semitones: 11 },
  { id: "P8", name: "纯八度", semitones: 12 },
];
type ChromaticNote = (typeof CHROMATIC_SCALE)[number];

function randomIndex(maxExclusive: number): number {
  return Math.floor(Math.random() * maxExclusive);
}

function getActiveStrings(config: GameConfig): number[] {
  const normalized = config.strings
    .filter((stringIndex) => stringIndex >= 0 && stringIndex < currentTuning.length)
    .sort((a, b) => a - b);

  if (normalized.length > 0) {
    return normalized;
  }

  return ALL_STRINGS;
}

function buildValidAnswers(targetNote: string, activeStrings: number[]): BoardPosition[] {
  const positions: BoardPosition[] = [];

  for (const stringIndex of activeStrings) {
    for (let fretIndex = 0; fretIndex < FRET_COUNT; fretIndex += 1) {
      const note = getNoteAtFret(stringIndex, fretIndex).note;
      if (note === targetNote) {
        positions.push({ stringIndex, fretIndex });
      }
    }
  }

  return positions;
}

function buildCircleQuestion(index: number, config: GameConfig): QuestionPayload {
  const activeStrings = getActiveStrings(config);
  const circlePool = config.subOptions.includes("P5") ? CIRCLE_OF_FIFTHS : CIRCLE_OF_FOURTHS;
  const targetNote = circlePool[index % circlePool.length];

  return {
    targetNote,
    questionText: targetNote,
    validAnswers: buildValidAnswers(targetNote, activeStrings),
  };
}

function buildIntervalQuestion(config: GameConfig): QuestionPayload {
  const activeStrings = getActiveStrings(config);
  const selectedIntervals = INTERVAL_OPTIONS.filter((option) => config.subOptions.includes(option.id));
  const availableIntervals = selectedIntervals.length > 0 ? selectedIntervals : INTERVAL_OPTIONS;

  const rootString = activeStrings[randomIndex(activeStrings.length)]!;
  const rootFret = randomIndex(FRET_COUNT);
  const rootInfo = getNoteAtFret(rootString, rootFret);
  const interval = availableIntervals[randomIndex(availableIntervals.length)]!;
  const rootIndex = CHROMATIC_SCALE.indexOf(rootInfo.note as ChromaticNote);
  const targetNote = CHROMATIC_SCALE[(rootIndex + interval.semitones) % CHROMATIC_SCALE.length]!;

  return {
    targetNote,
    questionText: `${currentTuning[rootString]!.note}弦 - ${rootInfo.note} + ${interval.name}`,
    validAnswers: buildValidAnswers(targetNote, activeStrings),
  };
}

export function useGameLogic(mode: PracticeMode, config: GameConfig) {
  const { playNote } = useAudio();
  const normalizedConfig = config ?? DEFAULT_GAME_CONFIG;
  const initialQuestion = mode === "circle" ? buildCircleQuestion(0, normalizedConfig) : buildIntervalQuestion(normalizedConfig);

  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [targetNote, setTargetNote] = useState(initialQuestion.targetNote);
  const [questionText, setQuestionText] = useState(initialQuestion.questionText);
  const [questionFeedback, setQuestionFeedback] = useState<QuestionFeedback>("idle");
  const [activeFeedbackCell, setActiveFeedbackCell] = useState<(BoardPosition & { state: "correct" | "wrong" }) | null>(
    null,
  );
  const [hintAnswers, setHintAnswers] = useState<BoardPosition[]>([]);

  const circleIndexRef = useRef(mode === "circle" ? 1 : 0);
  const wrongCountRef = useRef(0);
  const currentQuestionRef = useRef<QuestionPayload | null>(initialQuestion);
  const clearFeedbackTimerRef = useRef<number | null>(null);
  const transitionTimerRef = useRef<number | null>(null);

  const clearTimers = useCallback(() => {
    if (clearFeedbackTimerRef.current !== null) {
      window.clearTimeout(clearFeedbackTimerRef.current);
      clearFeedbackTimerRef.current = null;
    }
    if (transitionTimerRef.current !== null) {
      window.clearTimeout(transitionTimerRef.current);
      transitionTimerRef.current = null;
    }
  }, []);

  const applyQuestion = useCallback((question: QuestionPayload) => {
    currentQuestionRef.current = question;
    wrongCountRef.current = 0;
    setTargetNote(question.targetNote);
    setQuestionText(question.questionText);
    setHintAnswers([]);
    setQuestionFeedback("idle");
    setActiveFeedbackCell(null);
  }, []);

  const pushNextQuestion = useCallback(() => {
    if (mode === "circle") {
      const question = buildCircleQuestion(circleIndexRef.current, normalizedConfig);
      circleIndexRef.current += 1;
      applyQuestion(question);
      return;
    }

    applyQuestion(buildIntervalQuestion(normalizedConfig));
  }, [applyQuestion, mode, normalizedConfig]);

  const handleFretClick = useCallback(
    async (stringIndex: number, fretIndex: number) => {
      if (isTransitioning) return;

      const question = currentQuestionRef.current;
      if (!question) {
        return;
      }

      const clicked = getNoteAtFret(stringIndex, fretIndex);
      await playNote(clicked.toneParam);

      if (clicked.note === question.targetNote) {
        clearTimers();
        wrongCountRef.current = 0;
        setScore((prev) => prev + 1);
        setCombo((prev) => prev + 1);
        setQuestionFeedback("correct");
        setActiveFeedbackCell({ stringIndex, fretIndex, state: "correct" });
        setHintAnswers([]);
        setIsTransitioning(true);

        transitionTimerRef.current = window.setTimeout(() => {
          pushNextQuestion();
          setIsTransitioning(false);
        }, 400);
        return;
      }

      wrongCountRef.current += 1;
      if (clearFeedbackTimerRef.current !== null) {
        window.clearTimeout(clearFeedbackTimerRef.current);
        clearFeedbackTimerRef.current = null;
      }
      setCombo(0);
      setQuestionFeedback("wrong");
      setActiveFeedbackCell({ stringIndex, fretIndex, state: "wrong" });

      if (wrongCountRef.current >= 3) {
        setHintAnswers(question.validAnswers);
      }

      clearFeedbackTimerRef.current = window.setTimeout(() => {
        setQuestionFeedback("idle");
        setActiveFeedbackCell(null);
      }, 140);
    },
    [clearTimers, isTransitioning, playNote, pushNextQuestion],
  );

  useEffect(() => {
    return () => clearTimers();
  }, [clearTimers]);

  return {
    score,
    combo,
    isTransitioning,
    targetNote,
    questionText,
    questionFeedback,
    activeFeedbackCell,
    hintAnswers,
    handleFretClick,
  };
}
