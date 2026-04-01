import { useState } from "react";
import type { AuthLevel, PinState } from "../ha/auth";

const LEVEL_LABEL: Record<AuthLevel, string> = {
  finn: "Finn",
  master: "Master",
  admin: "Admin",
};

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "⌫"];

export function PinPad({ requiredLevel, onSubmit, onCancel }: PinState) {
  const [digits, setDigits] = useState("");
  const [error, setError] = useState(false);

  const addDigit = (d: string) => {
    if (digits.length >= 4) return;
    const next = digits + d;
    setDigits(next);
    if (next.length === 4) {
      const ok = onSubmit(next);
      if (!ok) {
        setError(true);
        setTimeout(() => {
          setDigits("");
          setError(false);
        }, 600);
      }
    }
  };

  const del = () => setDigits((d) => d.slice(0, -1));

  return (
    <div
      className="absolute inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50"
      onPointerDown={(e) => e.stopPropagation()}
    >
      <div className="bg-gray-900 border border-white/10 rounded-3xl p-8 w-72 flex flex-col items-center">
        <p className="text-white/30 text-xs uppercase tracking-widest mb-6">
          {LEVEL_LABEL[requiredLevel]} PIN
        </p>

        {/* Dots */}
        <div className={`flex gap-5 mb-8 transition-all ${error ? "animate-shake" : ""}`}>
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full transition-colors duration-150 ${
                digits.length > i
                  ? error
                    ? "bg-red-500"
                    : "bg-amber-400"
                  : "bg-white/20"
              }`}
            />
          ))}
        </div>

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-3 w-full">
          {KEYS.map((k, i) =>
            k === "" ? (
              <div key={i} />
            ) : (
              <button
                key={k}
                onClick={() => (k === "⌫" ? del() : addDigit(k))}
                className="h-14 rounded-2xl bg-white/10 text-white text-xl font-medium active:scale-90 active:bg-white/20 transition-all"
              >
                {k}
              </button>
            )
          )}
        </div>

        <button
          onClick={onCancel}
          className="mt-5 text-white/30 text-sm py-2 w-full active:text-white/60"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
