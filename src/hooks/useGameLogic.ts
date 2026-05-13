import { useCallback, useEffect, useRef, useState } from "react";
import { useAudio } from "./useAudio";
import {
  CHORD_FORMULAS,
  CHROMATIC_SCALE,
  FRET_RANGE_OPTIONS,
  IDENTIFY_NOTE_LABELS,
  IDENTIFY_NOTE_TO_PITCH,
  PITCH_TO_IDENTIFY_NOTE,
  currentTuning,
} from "../utils/constants";
import { getNoteAtFret } from "../utils/musicTheory";

export type PracticeMode = "circle" | "interval" | "randomNote" | "arpeggio" | "identifyByPosition" | "listenAndLocate";
export type QuestionFeedback = "idle" | "correct" | "wrong";
export type NoteKeyFeedbackState = "idle" | "correct" | "wrong";

export type BoardPosition = {
  stringIndex: number;
  fretIndex: number;
};

export type GameConfig = {
  strings: number[];
  fretRanges: string[];
  modeLength: number | "endless";
  subOptions: string[];
  listenModeType: "hardcoreAll" | "pickOne";
};

type IntervalOption = {
  id: string;
  name: string;
  semitones: number;
};

type CompletionMode = "anyOne" | "allRequired";

type QuestionPayload = {
  targetNote: string;
  questionText: string;
  validAnswers: BoardPosition[];
  completionMode: CompletionMode;
  identifyAnswerLabel?: (typeof IDENTIFY_NOTE_LABELS)[number];
  replayToneParam?: string;
};

const FRET_COUNT = 14;
const ALL_STRINGS = [0, 1, 2, 3, 4, 5];
const ALL_FRET_RANGE_IDS = FRET_RANGE_OPTIONS.map((item) => item.id);
const DEFAULT_GAME_CONFIG: GameConfig = {
  strings: ALL_STRINGS,
  fretRanges: ALL_FRET_RANGE_IDS,
  modeLength: 20,
  subOptions: [],
  listenModeType: "hardcoreAll",
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

function toPositionKey(pos: BoardPosition): string {
  return `${pos.stringIndex}-${pos.fretIndex}`;
}

function getActiveStrings(config: GameConfig): number[] {
  const normalized = Array.from(new Set(config.strings))
    .filter((stringIndex) => stringIndex >= 0 && stringIndex < currentTuning.length)
    .sort((a, b) => a - b);

  if (normalized.length > 0) return normalized;
  return ALL_STRINGS;
}

function getAllowedFrets(config: GameConfig, mode: PracticeMode): Set<number> {
  if (mode !== "arpeggio") {
    const allFrets = new Set<number>();
    for (let fret = 0; fret < FRET_COUNT; fret += 1) allFrets.add(fret);
    return allFrets;
  }

  const selectedRanges = FRET_RANGE_OPTIONS.filter((item) => config.fretRanges.includes(item.id));
  const ranges = selectedRanges.length > 0 ? selectedRanges : FRET_RANGE_OPTIONS;
  const allowedFrets = new Set<number>();

  for (const range of ranges) {
    let start: number = range.minFret;
    if (range.id === "low_3_7") start = 4;
    if (range.id === "mid_7_10") start = 8;
    if (range.id === "high_10_13") start = 11;

    for (let fret = start; fret <= range.maxFret; fret += 1) {
      if (fret >= 0 && fret < FRET_COUNT) allowedFrets.add(fret);
    }
  }

  return allowedFrets;
}

function buildValidAnswers(targetNotes: string[], activeStrings: number[], allowedFrets: Set<number>): BoardPosition[] {
  const targetSet = new Set(targetNotes);
  const positions: BoardPosition[] = [];

  for (const stringIndex of activeStrings) {
    for (let fretIndex = 0; fretIndex < FRET_COUNT; fretIndex += 1) {
      if (!allowedFrets.has(fretIndex)) continue;
      const note = getNoteAtFret(stringIndex, fretIndex).note;
      if (targetSet.has(note)) positions.push({ stringIndex, fretIndex });
    }
  }

  return positions;
}

function buildValidAnswersByToneParam(targetToneParam: string, activeStrings: number[], allowedFrets: Set<number>): BoardPosition[] {
  const positions: BoardPosition[] = [];

  for (const stringIndex of activeStrings) {
    for (let fretIndex = 0; fretIndex < FRET_COUNT; fretIndex += 1) {
      if (!allowedFrets.has(fretIndex)) continue;
      const noteInfo = getNoteAtFret(stringIndex, fretIndex);
      if (noteInfo.toneParam === targetToneParam) {
        positions.push({ stringIndex, fretIndex });
      }
    }
  }

  return positions;
}

function buildCircleQuestion(index: number, config: GameConfig): QuestionPayload {
  const activeStrings = getActiveStrings(config);
  const allowedFrets = getAllowedFrets(config, "circle");
  const circlePool = config.subOptions.includes("P5") ? CIRCLE_OF_FIFTHS : CIRCLE_OF_FOURTHS;
  const targetNote = circlePool[index % circlePool.length];

  return {
    targetNote,
    questionText: targetNote,
    validAnswers: buildValidAnswers([targetNote], activeStrings, allowedFrets),
    completionMode: "anyOne",
  };
}

function buildIntervalQuestion(config: GameConfig): QuestionPayload {
  const activeStrings = getActiveStrings(config);
  const allowedFrets = getAllowedFrets(config, "interval");
  const selectedIntervals = INTERVAL_OPTIONS.filter((option) => config.subOptions.includes(option.id));
  const availableIntervals = selectedIntervals.length > 0 ? selectedIntervals : INTERVAL_OPTIONS;

  const rootString = activeStrings[randomIndex(activeStrings.length)]!;
  const allowedFretValues = Array.from(allowedFrets);
  const rootFret = allowedFretValues[randomIndex(allowedFretValues.length)]!;
  const rootInfo = getNoteAtFret(rootString, rootFret);
  const interval = availableIntervals[randomIndex(availableIntervals.length)]!;
  const rootIndex = CHROMATIC_SCALE.indexOf(rootInfo.note as ChromaticNote);
  const targetNote = CHROMATIC_SCALE[(rootIndex + interval.semitones) % CHROMATIC_SCALE.length]!;

  return {
    targetNote,
    questionText: `${currentTuning[rootString]!.note} 弦 - ${rootInfo.note} + ${interval.name}`,
    validAnswers: buildValidAnswers([targetNote], activeStrings, allowedFrets),
    completionMode: "anyOne",
  };
}

function buildRandomNoteQuestion(config: GameConfig): QuestionPayload {
  const activeStrings = getActiveStrings(config);
  const allowedFrets = getAllowedFrets(config, "randomNote");
  const selectedNotes = CHROMATIC_SCALE.filter((note) => config.subOptions.includes(note));
  const notePool = selectedNotes.length > 0 ? selectedNotes : [...CHROMATIC_SCALE];
  const isAllStringsMode = activeStrings.length === ALL_STRINGS.length;

  if (isAllStringsMode) {
    const targetNote = notePool[randomIndex(notePool.length)]!;
    return {
      targetNote,
      questionText: targetNote,
      validAnswers: buildValidAnswers([targetNote], activeStrings, allowedFrets),
      completionMode: "allRequired",
    };
  }

  const playableTargets: { stringIndex: number; note: string; answers: BoardPosition[] }[] = [];
  for (const stringIndex of activeStrings) {
    for (const note of notePool) {
      const answers = buildValidAnswers([note], [stringIndex], allowedFrets);
      if (answers.length > 0) playableTargets.push({ stringIndex, note, answers });
    }
  }

  const picked = playableTargets[randomIndex(playableTargets.length)]!;

  return {
    targetNote: picked.note,
    questionText: `${currentTuning[picked.stringIndex]!.note} 弦 - ${picked.note}`,
    validAnswers: picked.answers,
    completionMode: "anyOne",
  };
}

function buildArpeggioQuestion(config: GameConfig): QuestionPayload {
  const activeStrings = getActiveStrings(config);
  const allowedFrets = getAllowedFrets(config, "arpeggio");
  const selectedChordFormulas = CHORD_FORMULAS.filter((formula) => config.subOptions.includes(formula.id));
  const chordPool = selectedChordFormulas.length > 0 ? selectedChordFormulas : CHORD_FORMULAS;

  for (let attempts = 0; attempts < 36; attempts += 1) {
    const rootNote = CHROMATIC_SCALE[randomIndex(CHROMATIC_SCALE.length)]!;
    const selectedChord = chordPool[randomIndex(chordPool.length)]!;
    const rootIndex = CHROMATIC_SCALE.indexOf(rootNote as ChromaticNote);
    const chordNotes = selectedChord.semitones.map((step) => CHROMATIC_SCALE[(rootIndex + step) % CHROMATIC_SCALE.length]!);
    const validAnswers = buildValidAnswers(chordNotes, activeStrings, allowedFrets);
    if (validAnswers.length > 0) {
      return {
        targetNote: rootNote,
        questionText: `${rootNote}${selectedChord.name}`,
        validAnswers,
        completionMode: "allRequired",
      };
    }
  }

  return {
    targetNote: "C",
    questionText: "CMaj",
    validAnswers: buildValidAnswers(["C", "E", "G"], activeStrings, allowedFrets),
    completionMode: "allRequired",
  };
}

function buildIdentifyByPositionQuestion(config: GameConfig): QuestionPayload {
  const activeStrings = getActiveStrings(config);
  const selectedLabels = IDENTIFY_NOTE_LABELS.filter((label) => config.subOptions.includes(label));
  const labelPool = selectedLabels.length > 0 ? selectedLabels : [...IDENTIFY_NOTE_LABELS];
  const pitchPool = new Set(labelPool.map((label) => IDENTIFY_NOTE_TO_PITCH[label]));

  const candidates: { pos: BoardPosition; pitch: ChromaticNote; label: (typeof IDENTIFY_NOTE_LABELS)[number] }[] = [];
  for (const stringIndex of activeStrings) {
    for (let fretIndex = 0; fretIndex < FRET_COUNT; fretIndex += 1) {
      const pitch = getNoteAtFret(stringIndex, fretIndex).note as ChromaticNote;
      if (!pitchPool.has(pitch)) continue;
      candidates.push({ pos: { stringIndex, fretIndex }, pitch, label: PITCH_TO_IDENTIFY_NOTE[pitch] });
    }
  }

  const picked = candidates[randomIndex(candidates.length)]!;
  return {
    targetNote: picked.pitch,
    questionText: `${currentTuning[picked.pos.stringIndex]!.note} 弦 - ${picked.pos.fretIndex} 品`,
    validAnswers: [picked.pos],
    completionMode: "anyOne",
    identifyAnswerLabel: picked.label,
    replayToneParam: getNoteAtFret(picked.pos.stringIndex, picked.pos.fretIndex).toneParam,
  };
}

function buildListenAndLocateQuestion(config: GameConfig): QuestionPayload {
  const activeStrings = getActiveStrings(config);
  const allowedFrets = getAllowedFrets(config, "listenAndLocate");
  const selectedLabels = IDENTIFY_NOTE_LABELS.filter((label) => config.subOptions.includes(label));
  const labelPool = selectedLabels.length > 0 ? selectedLabels : [...IDENTIFY_NOTE_LABELS];
  const pitchPool = new Set(labelPool.map((label) => IDENTIFY_NOTE_TO_PITCH[label]));

  const candidates: { toneParam: string; note: ChromaticNote }[] = [];
  const seen = new Set<string>();
  for (const stringIndex of activeStrings) {
    for (let fretIndex = 0; fretIndex < FRET_COUNT; fretIndex += 1) {
      if (!allowedFrets.has(fretIndex)) continue;
      const noteInfo = getNoteAtFret(stringIndex, fretIndex);
      const note = noteInfo.note as ChromaticNote;
      if (!pitchPool.has(note)) continue;
      if (seen.has(noteInfo.toneParam)) continue;
      seen.add(noteInfo.toneParam);
      candidates.push({ toneParam: noteInfo.toneParam, note });
    }
  }

  const picked = candidates[randomIndex(candidates.length)]!;
  const validAnswers = buildValidAnswersByToneParam(picked.toneParam, activeStrings, allowedFrets);

  return {
    targetNote: picked.note,
    questionText: "",
    validAnswers,
    completionMode: config.listenModeType === "pickOne" ? "anyOne" : "allRequired",
    replayToneParam: picked.toneParam,
  };
}

export function useGameLogic(mode: PracticeMode, config: GameConfig) {
  const { playNote } = useAudio();
  const normalizedConfig = config ?? DEFAULT_GAME_CONFIG;

  const buildInitialQuestion = () => {
    if (mode === "circle") return buildCircleQuestion(0, normalizedConfig);
    if (mode === "interval") return buildIntervalQuestion(normalizedConfig);
    if (mode === "randomNote") return buildRandomNoteQuestion(normalizedConfig);
    if (mode === "arpeggio") return buildArpeggioQuestion(normalizedConfig);
    if (mode === "identifyByPosition") return buildIdentifyByPositionQuestion(normalizedConfig);
    return buildListenAndLocateQuestion(normalizedConfig);
  };

  const initialQuestion = buildInitialQuestion();

  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [questionText, setQuestionText] = useState(initialQuestion.questionText);
  const [questionFeedback, setQuestionFeedback] = useState<QuestionFeedback>("idle");
  const [activeFeedbackCell, setActiveFeedbackCell] = useState<(BoardPosition & { state: "correct" | "wrong" }) | null>(null);
  const [hintAnswers, setHintAnswers] = useState<BoardPosition[]>([]);
  const [lockedCorrectAnswers, setLockedCorrectAnswers] = useState<BoardPosition[]>([]);
  const [highlightedFret, setHighlightedFret] = useState<BoardPosition | null>(mode === "identifyByPosition" ? initialQuestion.validAnswers[0] ?? null : null);
  const [noteKeyFeedback, setNoteKeyFeedback] = useState<{ state: NoteKeyFeedbackState; label: string | null }>({ state: "idle", label: null });
  const [noteHintLabel, setNoteHintLabel] = useState<string | null>(null);
  const [identifyWrongCount, setIdentifyWrongCount] = useState(0);

  const circleIndexRef = useRef(mode === "circle" ? 1 : 0);
  const wrongCountRef = useRef(0);
  const currentQuestionRef = useRef<QuestionPayload | null>(initialQuestion);
  const clearFeedbackTimerRef = useRef<number | null>(null);
  const transitionTimerRef = useRef<number | null>(null);
  const keyFeedbackTimerRef = useRef<number | null>(null);

  const clearTimers = useCallback(() => {
    if (clearFeedbackTimerRef.current !== null) {
      window.clearTimeout(clearFeedbackTimerRef.current);
      clearFeedbackTimerRef.current = null;
    }
    if (transitionTimerRef.current !== null) {
      window.clearTimeout(transitionTimerRef.current);
      transitionTimerRef.current = null;
    }
    if (keyFeedbackTimerRef.current !== null) {
      window.clearTimeout(keyFeedbackTimerRef.current);
      keyFeedbackTimerRef.current = null;
    }
  }, []);

  const applyQuestion = useCallback(
    (question: QuestionPayload) => {
      currentQuestionRef.current = question;
      wrongCountRef.current = 0;
      setQuestionText(question.questionText);
      setHintAnswers([]);
      setLockedCorrectAnswers([]);
      setQuestionFeedback("idle");
      setActiveFeedbackCell(null);
      if (mode === "identifyByPosition") {
        setHighlightedFret(question.validAnswers[0] ?? null);
        setNoteKeyFeedback({ state: "idle", label: null });
        setNoteHintLabel(null);
        setIdentifyWrongCount(0);
      } else {
        setHighlightedFret(null);
        setNoteKeyFeedback({ state: "idle", label: null });
        setNoteHintLabel(null);
        setIdentifyWrongCount(0);
      }
      if (mode === "listenAndLocate" && question.replayToneParam) {
        void playNote(question.replayToneParam);
      }
    },
    [mode, playNote],
  );

  const pushNextQuestion = useCallback(() => {
    if (mode === "circle") {
      const question = buildCircleQuestion(circleIndexRef.current, normalizedConfig);
      circleIndexRef.current += 1;
      applyQuestion(question);
      return;
    }
    if (mode === "interval") return applyQuestion(buildIntervalQuestion(normalizedConfig));
    if (mode === "randomNote") return applyQuestion(buildRandomNoteQuestion(normalizedConfig));
    if (mode === "arpeggio") return applyQuestion(buildArpeggioQuestion(normalizedConfig));
    if (mode === "identifyByPosition") return applyQuestion(buildIdentifyByPositionQuestion(normalizedConfig));
    return applyQuestion(buildListenAndLocateQuestion(normalizedConfig));
  }, [applyQuestion, mode, normalizedConfig]);

  const handleFretClick = useCallback(
    async (stringIndex: number, fretIndex: number) => {
      if (mode === "identifyByPosition") return;
      if (isTransitioning) return;

      const question = currentQuestionRef.current;
      if (!question) return;

      const clicked = getNoteAtFret(stringIndex, fretIndex);
      await playNote(clicked.toneParam);

      const clickedKey = toPositionKey({ stringIndex, fretIndex });
      const validKeySet = new Set(question.validAnswers.map(toPositionKey));
      const isCorrectPosition = validKeySet.has(clickedKey);

      if (isCorrectPosition) {
        clearTimers();
        wrongCountRef.current = 0;
        setIdentifyWrongCount(0);
        setQuestionFeedback("correct");
        setActiveFeedbackCell({ stringIndex, fretIndex, state: "correct" });
        setHintAnswers([]);

        if (question.completionMode === "allRequired") {
          setLockedCorrectAnswers((prev) => {
            const prevKeySet = new Set(prev.map(toPositionKey));
            if (prevKeySet.has(clickedKey)) return prev;

            const next = [...prev, { stringIndex, fretIndex }];
            const nextKeySet = new Set(next.map(toPositionKey));
            const allMatched = question.validAnswers.every((pos) => nextKeySet.has(toPositionKey(pos)));
            if (allMatched) {
              setScore((prevScore) => prevScore + 1);
              setCombo((prevCombo) => prevCombo + 1);
              setIsTransitioning(true);
              transitionTimerRef.current = window.setTimeout(() => {
                pushNextQuestion();
                setIsTransitioning(false);
              }, 400);
            }
            return next;
          });
          return;
        }

        setScore((prev) => prev + 1);
        setCombo((prev) => prev + 1);
        setIsTransitioning(true);
        transitionTimerRef.current = window.setTimeout(() => {
          pushNextQuestion();
          setIsTransitioning(false);
        }, 400);
        return;
      }

      wrongCountRef.current += 1;
      if (clearFeedbackTimerRef.current !== null) window.clearTimeout(clearFeedbackTimerRef.current);
      setCombo(0);
      setQuestionFeedback("wrong");
      setActiveFeedbackCell({ stringIndex, fretIndex, state: "wrong" });
      if (wrongCountRef.current >= 3) setHintAnswers(question.validAnswers);

      clearFeedbackTimerRef.current = window.setTimeout(() => {
        setQuestionFeedback("idle");
        setActiveFeedbackCell(null);
      }, 140);
    },
    [clearTimers, isTransitioning, mode, playNote, pushNextQuestion],
  );

  const handleNoteKeyClick = useCallback(
    (label: string) => {
      if (mode !== "identifyByPosition") return;
      if (isTransitioning) return;

      const question = currentQuestionRef.current;
      if (!question || !question.identifyAnswerLabel || !highlightedFret) return;

      if (label === question.identifyAnswerLabel) {
        clearTimers();
        wrongCountRef.current = 0;
        setQuestionFeedback("correct");
        setNoteKeyFeedback({ state: "correct", label });
        setActiveFeedbackCell({ ...highlightedFret, state: "correct" });
        setScore((prev) => prev + 1);
        setCombo((prev) => prev + 1);
        setIsTransitioning(true);
        transitionTimerRef.current = window.setTimeout(() => {
          pushNextQuestion();
          setIsTransitioning(false);
        }, 400);
        return;
      }

      wrongCountRef.current += 1;
      setIdentifyWrongCount(wrongCountRef.current);
      setCombo(0);
      setQuestionFeedback("wrong");
      setNoteKeyFeedback({ state: "wrong", label });
      if (wrongCountRef.current >= 3) setNoteHintLabel(question.identifyAnswerLabel);

      keyFeedbackTimerRef.current = window.setTimeout(() => {
        setQuestionFeedback("idle");
        setNoteKeyFeedback({ state: "idle", label: null });
      }, 180);
    },
    [clearTimers, highlightedFret, isTransitioning, mode, pushNextQuestion],
  );

  useEffect(() => {
    return () => clearTimers();
  }, [clearTimers]);

  useEffect(() => {
    if (mode !== "listenAndLocate") return;
    const toneParam = currentQuestionRef.current?.replayToneParam;
    if (!toneParam) return;
    void playNote(toneParam);
  }, [mode, playNote]);

  const replayCurrentQuestionAudio = useCallback(async () => {
    const question = currentQuestionRef.current;
    if (!question?.replayToneParam) return;
    await playNote(question.replayToneParam);
  }, [playNote]);

  return {
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
    handleFretClick,
    handleNoteKeyClick,
    replayCurrentQuestionAudio,
  };
}
