import { useMemo, useState } from "react";
import { CHORD_FORMULAS, CHROMATIC_SCALE, FRET_RANGE_OPTIONS, IDENTIFY_NOTE_LABELS } from "../../utils/constants";
import type { GameConfig } from "../../hooks/useGameLogic";

type ConfigPanelProps = {
  mode: "circle" | "interval" | "randomNote" | "arpeggio" | "identifyByPosition" | "listenAndLocate";
  onStart: (config: GameConfig) => void;
  onCancel: () => void;
};

const STRING_OPTIONS = [
  { label: "E (6弦)", value: 5 },
  { label: "A (5弦)", value: 4 },
  { label: "D (4弦)", value: 3 },
  { label: "G (3弦)", value: 2 },
  { label: "B (2弦)", value: 1 },
  { label: "E (1弦)", value: 0 },
];

const ALL_STRINGS = [0, 1, 2, 3, 4, 5];
const ALL_FRET_RANGES = FRET_RANGE_OPTIONS.map((item) => item.id);

const CIRCLE_MODES = [
  { id: "P4", label: "四度圈" },
  { id: "P5", label: "五度圈" },
];

const INTERVAL_OPTIONS = [
  { id: "m2", label: "小二度" },
  { id: "M2", label: "大二度" },
  { id: "m3", label: "小三度" },
  { id: "M3", label: "大三度" },
  { id: "P4", label: "纯四度" },
  { id: "P5", label: "纯五度" },
  { id: "m6", label: "小六度" },
  { id: "M6", label: "大六度" },
  { id: "m7", label: "小七度" },
  { id: "M7", label: "大七度" },
  { id: "P8", label: "纯八度" },
];

const ARPEGGIO_OPTIONS = CHORD_FORMULAS.map((item) => ({ id: item.id, label: item.name }));

function getInitialSubOptions(mode: ConfigPanelProps["mode"]): string[] {
  if (mode === "circle") return ["P4"];
  if (mode === "randomNote") return [...CHROMATIC_SCALE];
  if (mode === "arpeggio") return CHORD_FORMULAS.map((item) => item.id);
  if (mode === "identifyByPosition" || mode === "listenAndLocate") return [...IDENTIFY_NOTE_LABELS];
  return [];
}

function ConfigPanel({ mode, onStart, onCancel }: ConfigPanelProps) {
  const [selectedStrings, setSelectedStrings] = useState<number[]>([...ALL_STRINGS]);
  const [selectedFretRanges, setSelectedFretRanges] = useState<string[]>([...ALL_FRET_RANGES]);
  const [modeLength, setModeLength] = useState<number | "endless">(20);
  const [selectedSubOptions, setSelectedSubOptions] = useState<string[]>(getInitialSubOptions(mode));
  const [listenModeType, setListenModeType] = useState<"hardcoreAll" | "pickOne">("hardcoreAll");

  const toggleString = (stringIndex: number) => {
    setSelectedStrings((prev) => (prev.includes(stringIndex) ? prev.filter((s) => s !== stringIndex) : [...prev, stringIndex]));
  };

  const toggleFretRange = (rangeId: string) => {
    setSelectedFretRanges((prev) => (prev.includes(rangeId) ? prev.filter((id) => id !== rangeId) : [...prev, rangeId]));
  };

  const toggleSubOption = (optionId: string) => {
    setSelectedSubOptions((prev) => {
      if (mode === "circle") return [optionId];
      return prev.includes(optionId) ? prev.filter((o) => o !== optionId) : [...prev, optionId];
    });
  };

  const handleStart = () => {
    onStart({ strings: selectedStrings, fretRanges: selectedFretRanges, modeLength, subOptions: selectedSubOptions, listenModeType });
  };

  const isValid = selectedStrings.length > 0 && selectedSubOptions.length > 0 && (mode !== "arpeggio" || selectedFretRanges.length > 0);

  const rightTitle = useMemo(() => {
    if (mode === "circle") return "练习模式";
    if (mode === "interval") return "选择音程";
    if (mode === "randomNote") return "目标音符池";
    if (mode === "identifyByPosition" || mode === "listenAndLocate") return "目标音符池";
    return "和弦类型";
  }, [mode]);

  const isAllStringsSelected = selectedStrings.length === ALL_STRINGS.length;
  const rightAllCount =
    mode === "interval"
      ? INTERVAL_OPTIONS.length
      : mode === "randomNote"
        ? CHROMATIC_SCALE.length
        : mode === "identifyByPosition" || mode === "listenAndLocate"
          ? IDENTIFY_NOTE_LABELS.length
          : ARPEGGIO_OPTIONS.length;
  const isRightAllSelected = selectedSubOptions.length === rightAllCount;
  const isAllRangesSelected = selectedFretRanges.length === ALL_FRET_RANGES.length;

  return (
    <section className="w-full max-w-4xl mx-auto rounded-2xl bg-zinc-900 border border-zinc-700 p-6 shadow-2xl">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex-1 space-y-6">
          {mode !== "identifyByPosition" && mode !== "listenAndLocate" ? (
            <div className="space-y-3">
              <label className="text-sm font-medium text-zinc-300">练习长度</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setModeLength(20)}
                  className={`py-3 rounded-lg border transition ${
                    modeLength === 20
                      ? "bg-zinc-700 border-zinc-500 text-white"
                      : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-700"
                  }`}
                >
                  20 题
                </button>
                <button
                  type="button"
                  onClick={() => setModeLength("endless")}
                  className={`py-3 rounded-lg border transition ${
                    modeLength === "endless"
                      ? "bg-zinc-700 border-zinc-500 text-white"
                      : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-700"
                  }`}
                >
                  无尽
                </button>
              </div>
            </div>
          ) : null}

          <div className="space-y-3">
            <label className="text-sm font-medium text-zinc-300">练习弦数</label>
            <div className="grid grid-cols-3 gap-3">
              {STRING_OPTIONS.map((stringOption) => {
                const isSelected = selectedStrings.includes(stringOption.value);
                return (
                  <button
                    key={stringOption.value}
                    type="button"
                    onClick={() => toggleString(stringOption.value)}
                    className={`py-3 rounded-lg border transition ${
                      isSelected
                        ? "bg-zinc-700 border-zinc-500 text-white"
                        : "bg-zinc-800 border-zinc-700 text-zinc-500 hover:bg-zinc-700"
                    }`}
                  >
                    <span className="font-bold">{stringOption.label}</span>
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              onClick={() => setSelectedStrings(isAllStringsSelected ? [] : [...ALL_STRINGS])}
              className="w-full text-center text-sm text-zinc-400 hover:text-zinc-200 mt-2 cursor-pointer transition-colors"
            >
              {isAllStringsSelected ? "取消全选" : "全选所有弦"}
            </button>
          </div>

          {mode === "arpeggio" ? (
            <div className="space-y-3">
              <label className="text-sm font-medium text-zinc-300">把位选择</label>
              <div className="grid grid-cols-2 gap-3">
                {FRET_RANGE_OPTIONS.map((range) => {
                  const isSelected = selectedFretRanges.includes(range.id);
                  return (
                    <button
                      key={range.id}
                      type="button"
                      onClick={() => toggleFretRange(range.id)}
                      className={`py-3 rounded-lg border transition ${
                        isSelected
                          ? "bg-zinc-700 border-zinc-500 text-white"
                          : "bg-zinc-800 border-zinc-700 text-zinc-500 hover:bg-zinc-700"
                      }`}
                    >
                      {range.label}
                    </button>
                  );
                })}
              </div>
              <button
                type="button"
                onClick={() => setSelectedFretRanges(isAllRangesSelected ? [] : [...ALL_FRET_RANGES])}
                className="w-full text-center text-sm text-zinc-400 hover:text-zinc-200 mt-2 cursor-pointer transition-colors"
              >
                {isAllRangesSelected ? "取消全选" : "全选把位"}
              </button>
            </div>
          ) : null}
        </div>

        <div className="flex-1 border-t md:border-t-0 md:border-l border-zinc-700 pt-6 md:pt-0 md:pl-6 space-y-6">
          <div className="space-y-3">
            <label className="text-sm font-medium text-zinc-300">{rightTitle}</label>
            {mode === "circle" ? (
              <div className="grid grid-cols-2 gap-3">
                {CIRCLE_MODES.map((opt) => {
                  const isSelected = selectedSubOptions.includes(opt.id);
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => toggleSubOption(opt.id)}
                      className={`py-3 rounded-lg border transition ${
                        isSelected
                          ? "bg-zinc-700 border-zinc-500 text-white"
                          : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-700"
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            ) : (
              <>
                <div className={`grid gap-3 ${mode === "randomNote" || mode === "identifyByPosition" || mode === "listenAndLocate" ? "grid-cols-4" : "grid-cols-2"}`}>
                  {(mode === "interval"
                    ? INTERVAL_OPTIONS
                    : mode === "randomNote"
                      ? CHROMATIC_SCALE.map((note) => ({ id: note, label: note }))
                      : mode === "identifyByPosition" || mode === "listenAndLocate"
                        ? IDENTIFY_NOTE_LABELS.map((note) => ({ id: note, label: note }))
                        : ARPEGGIO_OPTIONS
                  ).map((opt) => {
                    const isSelected = selectedSubOptions.includes(opt.id);
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => toggleSubOption(opt.id)}
                        className={`py-3 rounded-lg border transition ${
                          isSelected
                            ? "bg-zinc-700 border-zinc-500 text-white"
                            : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-700"
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (mode === "interval") setSelectedSubOptions(isRightAllSelected ? [] : INTERVAL_OPTIONS.map((opt) => opt.id));
                    if (mode === "randomNote") setSelectedSubOptions(isRightAllSelected ? [] : [...CHROMATIC_SCALE]);
                    if (mode === "identifyByPosition" || mode === "listenAndLocate") {
                      setSelectedSubOptions(isRightAllSelected ? [] : [...IDENTIFY_NOTE_LABELS]);
                    }
                    if (mode === "arpeggio") setSelectedSubOptions(isRightAllSelected ? [] : ARPEGGIO_OPTIONS.map((opt) => opt.id));
                  }}
                  className="w-full text-center text-sm text-zinc-400 hover:text-zinc-200 mt-2 cursor-pointer transition-colors"
                >
                  {isRightAllSelected ? "取消全选" : "全选"}
                </button>
                {mode === "listenAndLocate" ? (
                  <div className="pt-2 space-y-3">
                    <label className="text-sm font-medium text-zinc-300">过关模式</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setListenModeType("hardcoreAll")}
                        className={`py-3 rounded-lg border transition ${
                          listenModeType === "hardcoreAll"
                            ? "bg-zinc-700 border-zinc-500 text-white"
                            : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-700"
                        }`}
                      >
                        硬核全找
                      </button>
                      <button
                        type="button"
                        onClick={() => setListenModeType("pickOne")}
                        className={`py-3 rounded-lg border transition ${
                          listenModeType === "pickOne"
                            ? "bg-zinc-700 border-zinc-500 text-white"
                            : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-700"
                        }`}
                      >
                        任选其一
                      </button>
                    </div>
                  </div>
                ) : null}
              </>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4">
        <button
          type="button"
          onClick={onCancel}
          className="py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 text-zinc-300 font-medium transition"
        >
          取消
        </button>
        <button
          type="button"
          onClick={handleStart}
          disabled={!isValid}
          className={`py-3 rounded-xl font-medium transition ${
            !isValid
              ? "bg-zinc-800 border border-zinc-700 text-zinc-600 cursor-not-allowed"
              : "bg-green-700 hover:bg-green-600 border border-green-500 text-white"
          }`}
        >
          开始练习
        </button>
      </div>
    </section>
  );
}

export default ConfigPanel;
