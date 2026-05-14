type ResultModalProps = {
  totalErrors: number;
  accuracy: number;
  durationSeconds: number;
  onBack: () => void;
  onContinue: () => void;
};

function ResultModal({ totalErrors, accuracy, durationSeconds, onBack, onContinue }: ResultModalProps) {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-9 w-96 flex flex-col items-center">
        <h2 className="text-xl font-bold mb-6">练习完成</h2>

        <div className="w-full space-y-3 text-zinc-300">
          <div className="flex items-center justify-between">
            <span>错误数量</span>
            <span>{totalErrors}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>正确率</span>
            <span>{accuracy.toFixed(1)}%</span>
          </div>
          <div className="flex items-center justify-between">
            <span>总用时</span>
            <span>{durationSeconds.toFixed(1)}s</span>
          </div>
        </div>

        <div className="w-full mt-8 flex gap-4">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 py-3 rounded-md bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors"
          >
            返回大厅
          </button>
          <button
            type="button"
            onClick={onContinue}
            className="flex-1 py-3 rounded-md bg-green-600 text-white hover:bg-green-500 transition-colors"
          >
            继续练习
          </button>
        </div>
      </div>
    </div>
  );
}

export default ResultModal;
