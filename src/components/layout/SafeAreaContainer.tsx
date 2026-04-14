import type { PropsWithChildren } from "react";

function SafeAreaContainer({ children }: PropsWithChildren) {
  return (
    <div
      className="w-full h-full bg-appBg text-zinc-100"
      style={{
        paddingTop: "env(safe-area-inset-top)",
        paddingRight: "env(safe-area-inset-right)",
        paddingBottom: "env(safe-area-inset-bottom)",
        paddingLeft: "env(safe-area-inset-left)",
      }}
    >
      {children}
    </div>
  );
}

export default SafeAreaContainer;