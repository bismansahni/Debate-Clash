"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { startDebate } from "@/app/actions/debate-actions";
import { ArenaView } from "@/components/arena/ArenaView";

const TOPICS = [
  "Should AI replace human judges?",
  "Is remote work better than office work?",
  "Should social media be regulated?",
  "Is nuclear energy the future?",
  "Should college education be free?",
  "Will AI make programmers obsolete?",
  "Is capitalism the best economic system?",
];

function RotatingPlaceholder() {
  const [index, setIndex] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const topic = TOPICS[index] ?? "";

    if (!isDeleting && displayed.length < topic.length) {
      const timer = setTimeout(
        () => {
          setDisplayed(topic.slice(0, displayed.length + 1));
        },
        40 + Math.random() * 30,
      );
      return () => clearTimeout(timer);
    }

    if (!isDeleting && displayed.length === topic.length) {
      const timer = setTimeout(() => setIsDeleting(true), 2500);
      return () => clearTimeout(timer);
    }

    if (isDeleting && displayed.length > 0) {
      const timer = setTimeout(() => {
        setDisplayed(displayed.slice(0, -1));
      }, 20);
      return () => clearTimeout(timer);
    }

    if (isDeleting && displayed.length === 0) {
      setIsDeleting(false);
      setIndex((prev) => (prev + 1) % TOPICS.length);
    }
  }, [displayed, isDeleting, index]);

  return (
    <span className="text-[var(--arena-text-dim)]">
      {displayed}
      <span className="cursor-blink text-[var(--pro)]">|</span>
    </span>
  );
}

export default function DebateArena() {
  const [debateData, setDebateData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [debateId, setDebateId] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!debateId) return;

    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/debate/${debateId}`);
        if (response.ok) {
          const data = await response.json();
          setDebateData(data);
          if (data.status === "completed") {
            clearInterval(pollInterval);
          }
        }
      } catch (error) {
        console.error("Error polling debate status:", error);
      }
    }, 2000);

    return () => clearInterval(pollInterval);
  }, [debateId]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setDebateData(null);

    const formData = new FormData(e.currentTarget);
    const result = await startDebate(formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    if (result.success && result.debateId) {
      setDebateId(result.debateId);
      setDebateData({
        debateId: result.debateId,
        topic: formData.get("query") as string,
        status: "researching",
        currentPhase: "Initializing debate...",
      });
      setLoading(false);
    }
  };

  if (debateData) {
    return (
      <>
        <ArenaView debate={debateData} />
        {debateData?.status === "completed" && (
          <div className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-50">
            <button
              onClick={() => {
                setDebateData(null);
                setDebateId(null);
                setError("");
                setInputValue("");
              }}
              className="group relative px-6 py-3 font-[family-name:var(--font-chakra)] font-semibold
                         text-sm uppercase tracking-[0.15em]
                         text-[var(--arena-text)] border border-[var(--arena-border-active)]
                         bg-[var(--arena-bg)] hover:bg-[var(--arena-surface-hover)]
                         transition-all duration-300"
            >
              <span className="relative z-10">New Debate</span>
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity
                            bg-gradient-to-r from-[var(--pro-dim)] to-[var(--con-dim)]"
              />
            </button>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="arena-bg arena-grain arena-scanlines min-h-screen relative overflow-hidden">
      {/* Animated grid background */}
      <div className="absolute inset-0 arena-grid-animated" />

      {/* Central radial glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                   w-[800px] h-[800px] rounded-full animate-breathe pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(0,240,255,0.04) 0%, rgba(255,45,85,0.02) 40%, transparent 70%)",
        }}
      />

      {/* Main content */}
      <div className="relative z-10 h-screen flex flex-col justify-center items-center px-4">
        {/* ARENA Logo */}
        <motion.div
          initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-6"
        >
          <h1
            className="font-[family-name:var(--font-chakra)] font-bold
                       text-6xl sm:text-8xl lg:text-9xl
                       tracking-[0.3em] sm:tracking-[0.4em]
                       text-[var(--arena-text)] leading-none"
          >
            ARENA
          </h1>

          {/* Decorative line under ARENA */}
          <div className="flex items-center justify-center gap-3 mt-4">
            <div className="w-12 sm:w-20 h-px bg-gradient-to-r from-transparent to-[var(--pro)]" />
            <span
              className="font-[family-name:var(--font-jetbrains)] text-[0.65rem] sm:text-xs
                         tracking-[0.25em] uppercase text-[var(--arena-text-muted)]"
            >
              AI Debate Protocol
            </span>
            <div className="w-12 sm:w-20 h-px bg-gradient-to-l from-transparent to-[var(--con)]" />
          </div>
        </motion.div>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="font-[family-name:var(--font-source-serif)] text-[var(--arena-text-muted)]
                     text-sm sm:text-base text-center max-w-md mb-12 italic"
        >
          Enter a topic. Watch autonomous agents research, argue, and compete.
        </motion.p>

        {/* Terminal Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="w-full max-w-2xl"
        >
          <form onSubmit={onSubmit} className="relative group">
            {/* Terminal frame */}
            <div
              className="arena-panel corner-brackets p-1"
              style={{
                background: "linear-gradient(135deg, var(--arena-surface), rgba(0,240,255,0.02))",
              }}
            >
              {/* Terminal header bar */}
              <div className="flex items-center gap-2 px-4 py-2 border-b border-[var(--arena-border)]">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-[var(--con)] opacity-60" />
                  <div className="w-2 h-2 rounded-full bg-[var(--gold)] opacity-60" />
                  <div className="w-2 h-2 rounded-full bg-[#22c55e] opacity-60" />
                </div>
                <span className="font-[family-name:var(--font-jetbrains)] text-[0.6rem] text-[var(--arena-text-dim)] ml-2">
                  arena://debate-topic
                </span>
              </div>

              {/* Input area */}
              <div className="flex items-center px-4 py-4">
                <span className="font-[family-name:var(--font-jetbrains)] text-[var(--pro)] text-sm mr-3 flex-shrink-0">
                  {">"}
                </span>
                <div className="relative flex-1">
                  <input
                    ref={inputRef}
                    type="text"
                    name="query"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="w-full bg-transparent font-[family-name:var(--font-chakra)]
                             text-[var(--arena-text)] text-base sm:text-lg
                             placeholder-transparent focus:outline-none
                             caret-[var(--pro)]"
                    placeholder="Enter debate topic..."
                    required
                    autoComplete="off"
                  />
                  {/* Rotating placeholder shown when input is empty */}
                  {!inputValue && (
                    <div
                      className="absolute inset-0 flex items-center pointer-events-none
                                  font-[family-name:var(--font-chakra)] text-base sm:text-lg"
                    >
                      <RotatingPlaceholder />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Submit button */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full mt-4 relative overflow-hidden group/btn
                       font-[family-name:var(--font-chakra)] font-semibold
                       text-sm uppercase tracking-[0.2em]
                       py-4 border border-[var(--arena-border-active)]
                       text-[var(--arena-text)] bg-transparent
                       hover:border-[var(--pro)] transition-all duration-300
                       disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {/* Background glow on hover */}
              <div
                className="absolute inset-0 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300
                            bg-gradient-to-r from-[var(--pro-dim)] via-transparent to-[var(--con-dim)]"
              />

              {/* Pulse rings when loading */}
              {loading && (
                <>
                  <div className="absolute inset-0 border border-[var(--pro)] opacity-40 pulse-ring" />
                  <div
                    className="absolute inset-0 border border-[var(--pro)] opacity-20 pulse-ring"
                    style={{ animationDelay: "0.5s" }}
                  />
                </>
              )}

              <span className="relative z-10">{loading ? "Assembling Agents..." : "Initiate Debate"}</span>
            </motion.button>
          </form>
        </motion.div>

        {/* Error display */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-6 px-6 py-3 border border-[var(--con)] bg-[var(--con-dim)]
                       font-[family-name:var(--font-jetbrains)] text-sm text-[var(--con)]
                       max-w-2xl w-full"
            >
              <span className="opacity-60 mr-2">ERR:</span>
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom decoration */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-[var(--pro)] animate-flicker" />
          <span className="font-[family-name:var(--font-jetbrains)] text-[0.6rem] text-[var(--arena-text-dim)] uppercase tracking-[0.3em]">
            Powered by Inngest
          </span>
          <div className="w-1.5 h-1.5 rounded-full bg-[var(--con)] animate-flicker" />
        </motion.div>
      </div>
    </div>
  );
}
