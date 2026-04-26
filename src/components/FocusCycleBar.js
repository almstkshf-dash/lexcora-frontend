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

const focusTips = [
  "One task at a time. Deep focus only.",
  "Silence notifications for better flow.",
  "Deep breaths help keep the mind clear.",
  "Small steps lead to big results.",
  "Momentum is built one minute at a time."
];

export default function FocusCycleBar() {
  const [mode, setMode] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("focus-mode") || "focus";
    }
    return "focus";
  });
  const [isRunning, setIsRunning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("focus-seconds");
      return saved ? parseFloat(saved) : FOCUS_DURATION;
    }
    return FOCUS_DURATION;
  });

  const tip = useMemo(() => {
    const list = mode === "focus" ? focusTips : breakTips;
    return list[Math.floor(Math.random() * list.length)];
  }, [mode]);
  const duration = mode === "focus" ? FOCUS_DURATION : BREAK_DURATION;
  const progress = 1 - secondsLeft / duration;
  const rafRef = useRef(null);

  // Persist state
  useEffect(() => {
    localStorage.setItem("focus-mode", mode);
    localStorage.setItem("focus-seconds", secondsLeft.toString());
  }, [mode, secondsLeft]);

  // Sync with browser tab title
  useEffect(() => {
    const originalTitle = document.title.split(" | ")[0]; // Keep base title
    if (isRunning) {
      document.title = `(${formatTime(secondsLeft)}) ${mode === "focus" ? "Focus" : "Break"} | Lexcora`;
    } else {
      document.title = `Paused | Lexcora`;
    }
    return () => {
      document.title = "Lexcora";
    };
  }, [secondsLeft, isRunning, mode]);

  // Tick loop using requestAnimationFrame for smoother progress updates.
  useEffect(() => {
    if (!isRunning) return;

    let last = performance.now();
    const tick = (now) => {
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

        <div className="flex items-center gap-2">
          {mode === "break" ? (
            <Coffee size={14} className="shrink-0 text-amber-700 dark:text-amber-200" />
          ) : (
            <div className={cn(
              "h-2 w-2 rounded-full",
              isRunning ? "bg-primary animate-pulse" : "bg-muted"
            )} />
          )}
          <span className={cn(
            "line-clamp-1",
            mode === "break" ? "text-amber-700 dark:text-amber-200" : "text-muted-foreground"
          )}>
            {tip}
          </span>
        </div>
      </div>
    </div>
  );
}
