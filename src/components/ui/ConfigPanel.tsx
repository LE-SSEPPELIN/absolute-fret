import { useState } from "react";
import type { GameConfig } from "../../hooks/useGameLogic";

type ConfigPanelProps = {
  mode: "circle" | "interval";
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

function ConfigPanel({ mode, onStart, onCancel }: ConfigPanelProps) {
  const [selectedStrings, setSelectedStrings] = useState<number[]>([0, 1, 2, 3, 4, 5]);
  const [modeLength, setModeLength] = useState<number | "endless">(20);
  const [selectedSubOptions, setSelectedSubOptions] = useState<string[]>(mode === "circle" ? ["P4"] : []);

  const toggleString = (stringIndex: number) => {
    setSelectedStrings((prev) => {
      if (prev.includes(stringIndex)) {
        return prev.filter((s) => s !== stringIndex);
      }
      return [...prev, stringIndex];
    });
  };

  const toggleSubOption = (optionId: string) => {
    setSelectedSubOptions((prev) => {
      if (mode === "circle") {
        return [optionId];
      }
      if (prev.includes(optionId)) {
        return prev.filter((o) => o !== optionId);
      }
      return [...prev, optionId];
    });
  };

  const handleStart = () => {
    onStart({ strings: selectedStrings, modeLength, subOptions: selectedSubOptions });
  };

  const isAllStringsSelected = selectedStrings.length === 6;
  const isValid = selectedStrings.length > 0 && selectedSubOptions.length > 0;

  return (
    <section className="w-full max-w-4xl mx-auto rounded-2xl bg-zinc-900 border border-zinc-700 p-6 shadow-2xl">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex-1 space-y-6">
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
                20题
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

          <div className="space-y-3">
            <label className="text-sm font-medium text-zinc-300">练习弦数</label>
            <div className="grid grid-cols-3 gap-3">
              {STRING_OPTIONS.map((stringOption, index) => {
                const isSelected = selectedStrings.includes(stringOption.value);
                return (
                  <button
                    key={index}
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
              onClick={() =>
                setSelectedStrings(isAllStringsSelected ? [] : [0, 1, 2, 3, 4, 5])
              }
              className="w-full py-2 text-sm text-zinc-400 hover:text-zinc-200 transition"
            >
              {isAllStringsSelected ? "取消全选" : "全选所有弦"}
            </button>
          </div>
        </div>

        <div className="flex-1 border-t md:border-t-0 md:border-l border-zinc-700 pt-6 md:pt-0 md:pl-6 space-y-6">
          <div className="space-y-3">
            <label className="text-sm font-medium text-zinc-300">
              {mode === "circle" ? "练习模式" : "选择音程"}
            </label>
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
              <div className="grid grid-cols-2 gap-3">
                {INTERVAL_OPTIONS.map((opt) => {
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
