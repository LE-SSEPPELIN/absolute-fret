type FretMarkerProps = {
  isDouble: boolean;
};

function FretMarker({ isDouble }: FretMarkerProps) {
  if (isDouble) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 pointer-events-none">
        <span className="w-4 h-4 rounded-full bg-zinc-300 opacity-70" />
        <span className="w-4 h-4 rounded-full bg-zinc-300 opacity-70" />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <span className="w-4 h-4 rounded-full bg-zinc-300 opacity-70" />
    </div>
  );
}

export default FretMarker;
