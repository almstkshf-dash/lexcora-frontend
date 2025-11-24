"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Pause, Play, RefreshCw, Coffee } from "lucide-react";
import { cn } from "@/lib/utils";

const FOCUS_DURATION = 25 * 60; // 25 minutes
const BREAK_DURATION = 5 * 60; // 5 minutes

const breakTips = [
  "Unclench your jaw. Drop your shoulders.",
  "Look 20ft away for 20 seconds.",
  "Stand up, slow neck rolls, then hydrate.",
  "Take 5 deep breaths: in for 4, out for 6.",
  "Wiggle fingers, wrists, and ankles gently."
];

export default function FocusCycleBar() {
  const [mode, setMode] = useState("focus"); // focus | break
  const [isRunning, setIsRunning] = useState(true);
  const [secondsLeft, setSecondsLeft] = useState(FOCUS_DURATION);
  const tip = useMemo(
    () => breakTips[Math.floor(Math.random() * breakTips.length)],
    [mode]
  );
  const duration = mode === "focus" ? FOCUS_DURATION : BREAK_DURATION;
  const progress = 1 - secondsLeft / duration;
  const rafRef = useRef(null);

  // Tick loop using requestAnimationFrame for smoother progress updates.
  useEffect(() => {
    let last = performance.now();
    const tick = (now) => {
      if (!isRunning) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }
      const delta = (now - last) / 1000;
      last = now;
      setSecondsLeft((prev) => {
        const next = prev - delta;
        if (next <= 0) {
          const nextMode = mode === "focus" ? "break" : "focus";
          setMode(nextMode);
          return nextMode === "focus" ? FOCUS_DURATION : BREAK_DURATION;
        }
        return next;
      });
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isRunning, mode]);

  // Tint UI when on break.
  useEffect(() => {
    const root = document.documentElement;
    if (mode === "break") {
      root.classList.add("break-mode");
    } else {
      root.classList.remove("break-mode");
    }
    return () => root.classList.remove("break-mode");
  }, [mode]);

  const toggleRun = () => setIsRunning((prev) => !prev);
  const resetCycle = () => {
    setMode("focus");
    setSecondsLeft(FOCUS_DURATION);
    setIsRunning(true);
  };

  const formatTime = (value) => {
    const s = Math.max(0, Math.floor(value));
    const m = Math.floor(s / 60);
    const sec = `${s % 60}`.padStart(2, "0");
    return `${m}:${sec}`;
  };

  return (
    <div className="relative isolate">
      <div
        className="h-1.5 overflow-hidden rounded-full bg-muted/60 ring-1 ring-border/70"
        aria-label={`${mode === "focus" ? "Focus" : "Break"} timer`}
      >
        <div
          className={cn(
            "h-full transition-[width] duration-200 ease-out",
            mode === "break"
              ? "bg-gradient-to-r from-amber-400 via-orange-500 to-pink-500"
              : "bg-gradient-to-r from-primary via-blue-500 to-indigo-500"
          )}
          style={{ width: `${Math.min(100, Math.max(0, progress * 100)).toFixed(2)}%` }}
        />
      </div>

      <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "px-2 py-1 rounded-full font-medium",
              mode === "break"
                ? "bg-amber-500/10 text-amber-700 dark:text-amber-200"
                : "bg-primary/10 text-primary"
            )}
          >
            {mode === "break" ? "Break" : "Focus"}
          </span>
          <span className="font-semibold text-foreground">{formatTime(secondsLeft)}</span>
          <button
            onClick={toggleRun}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-muted/60 text-foreground hover:bg-muted transition-colors"
            aria-label={isRunning ? "Pause timer" : "Resume timer"}
          >
            {isRunning ? <Pause size={14} /> : <Play size={14} />}
          </button>
          <button
            onClick={resetCycle}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-muted/60 text-foreground hover:bg-muted transition-colors"
            aria-label="Reset focus cycle"
          >
            <RefreshCw size={14} />
          </button>
        </div>

        {mode === "break" ? (
          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-200">
            <Coffee size={14} className="shrink-0" />
            <span className="line-clamp-1">{tip}</span>
          </div>
        ) : (
          <span className="text-muted-foreground">Stay on task, break soon.</span>
        )}
      </div>
    </div>
  );
}
