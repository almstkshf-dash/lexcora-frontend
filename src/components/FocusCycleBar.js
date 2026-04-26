"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Pause, Play, RefreshCw, Coffee, X } from "lucide-react";
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

  // Persist state - throttled to avoid 60fps I/O
  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem("focus-mode", mode);
      localStorage.setItem("focus-seconds", Math.floor(secondsLeft).toString());
    }, 1000); // Only persist once per second max
    return () => clearTimeout(timer);
  }, [mode, secondsLeft]);

  // Sync with browser tab title - only on integer second changes
  useEffect(() => {
    const displaySeconds = Math.floor(secondsLeft);
    if (isRunning) {
      document.title = `(${formatTime(displaySeconds)}) ${mode === "focus" ? "Focus" : "Break"} | Lexcora`;
    } else {
      document.title = `Paused | Lexcora`;
    }
    return () => {
      document.title = "Lexcora";
    };
  }, [Math.floor(secondsLeft), isRunning, mode]);

  // Tick loop using setInterval for 1-second updates instead of 60fps RAF.
  // This drastically reduces React reconciliation work and CPU usage.
  useEffect(() => {
    if (!isRunning) return;

    const intervalId = setInterval(() => {
      setSecondsLeft((prev) => {
        const next = prev - 1;
        if (next <= 0) {
          const nextMode = mode === "focus" ? "break" : "focus";
          setMode(nextMode);
          return nextMode === "focus" ? FOCUS_DURATION : BREAK_DURATION;
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(intervalId);
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

  const [isMinimized, setIsMinimized] = useState(false);

  return (
    <div className={cn("relative isolate transition-all duration-300", isMinimized ? "opacity-60 hover:opacity-100" : "")}>
      <div className="absolute -top-1 -right-1 z-10">
        <button 
          onClick={() => setIsMinimized(!isMinimized)}
          className="h-5 w-5 flex items-center justify-center rounded-full bg-muted/80 text-muted-foreground hover:bg-muted hover:text-foreground border border-border shadow-sm transition-transform active:scale-95"
          title={isMinimized ? "Show Focus Timer" : "Minimize"}
        >
          {isMinimized ? <Play size={10} /> : <X size={10} />}
        </button>
      </div>

      {!isMinimized && (
        <>
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
                "line-clamp-1 max-w-[120px] md:max-w-none",
                mode === "break" ? "text-amber-700 dark:text-amber-200" : "text-muted-foreground"
              )}>
                {tip}
              </span>
            </div>
          </div>
        </>
      )}

      {isMinimized && (
        <div className="flex items-center gap-2 py-1 px-2 rounded-lg bg-muted/40 border border-border/50">
          <div className={cn(
            "h-2 w-2 rounded-full",
            isRunning ? (mode === 'break' ? 'bg-amber-500 animate-pulse' : 'bg-primary animate-pulse') : "bg-muted"
          )} />
          <span className="text-[10px] font-bold text-foreground/70">{formatTime(secondsLeft)}</span>
          <span className="text-[10px] text-muted-foreground truncate max-w-[80px]">
            {mode === 'focus' ? 'Focusing...' : 'Break time!'}
          </span>
        </div>
      )}
    </div>
  );
}
