"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { HEX_CLIP_PATH } from "@/lib/hex";
import { Check, Send, Sparkles, Paperclip, AlertCircle, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

const PROJECT_TYPES = [
  "Web Application",
  "Mobile App",
  "Design System",
  "Brand Identity",
  "Video / Motion",
  "Technical Advisory",
];

const BUDGET_RANGES = [
  "$500 – $1,500",
  "$1,500 – $3,000",
  "$3,000 – $5,000",
  "$5,000+",
  "Discuss with me",
];

const TIMELINES = [
  "Immediate (< 2 weeks)",
  "2 – 4 weeks",
  "1 – 2 months",
  "Flexible / Ongoing",
];

export function ProjectBriefForm() {
  const searchParams = useSearchParams();
  const initialService = searchParams.get("service") || "";

  const [projectType, setProjectType] = useState<string>(
    initialService || PROJECT_TYPES[0]
  );
  const [budget, setBudget] = useState<string>(BUDGET_RANGES[1]);
  const [timeline, setTimeline] = useState<string>(TIMELINES[1]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [description, setDescription] = useState("");
  const [honeypot, setHoneypot] = useState(""); // Bot honeypot

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          description,
          projectType,
          budget,
          timeline,
          honeypot,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit project brief.");
      }

      setIsSuccess(true);
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  // ── Success State: The Hive Locks Animation ─────────────────────────────
  if (isSuccess) {
    return (
      <div className="bg-surface border border-primary p-8 sm:p-12 text-center space-y-6 animate-fadeIn">
        {/* Success Hex Lock Emblem */}
        <div className="flex justify-center">
          <div
            className="w-20 h-24 bg-primary text-primary-foreground flex items-center justify-center animate-bounce shadow-lg shadow-primary/20"
            style={{ clipPath: HEX_CLIP_PATH }}
          >
            <Lock className="w-8 h-8" />
          </div>
        </div>

        <div className="space-y-2 max-w-md mx-auto">
          <span className="text-xs font-mono uppercase tracking-[0.25em] text-primary font-bold">
            Transmission Locked · Confirmed
          </span>
          <h3 className="text-2xl sm:text-3xl font-bold text-foreground">
            Project Brief Received
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Thank you, <span className="text-foreground font-semibold">{name}</span>. Your project parameters have been filed in the Hive inbox.
          </p>
        </div>

        <div className="p-4 bg-background border border-border inline-block text-xs font-mono text-muted-foreground max-w-md">
          <p>
            ⏱ <strong className="text-foreground">Response Expectation:</strong> You will receive a direct reply within <strong>24–48 hours</strong> with scope clarification or a scheduling link.
          </p>
        </div>

        <div className="pt-4">
          <button
            onClick={() => {
              setIsSuccess(false);
              setName("");
              setEmail("");
              setDescription("");
            }}
            className="px-5 py-2.5 text-xs font-mono uppercase tracking-wider bg-surface border border-border hover:border-primary text-foreground transition-colors"
          >
            Send Another Dispatch
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-surface border border-border p-6 sm:p-8 md:p-10 space-y-8">
      {/* ── 1. Project Type Hex Selector ────────────────────────────────────── */}
      <div className="space-y-3">
        <label className="block text-xs font-mono uppercase tracking-widest text-primary font-semibold">
          1. Select Project Type
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {PROJECT_TYPES.map((type) => {
            const isSelected = projectType === type;

            return (
              <button
                type="button"
                key={type}
                onClick={() => setProjectType(type)}
                className={cn(
                  "py-3 px-3 text-xs font-mono transition-all border text-center flex items-center justify-center gap-1.5",
                  isSelected
                    ? "bg-primary text-primary-foreground border-primary font-semibold shadow-sm"
                    : "bg-background text-muted-foreground border-border hover:border-primary hover:text-foreground"
                )}
              >
                {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-primary-foreground" />}
                <span>{type}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 2. Budget & Timeline ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-xs font-mono uppercase tracking-widest text-primary font-semibold">
            2. Anticipated Budget
          </label>
          <select
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            className="w-full bg-background border border-border px-3.5 py-2.5 text-xs font-mono text-foreground focus:outline-none focus:border-primary"
          >
            {BUDGET_RANGES.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-mono uppercase tracking-widest text-primary font-semibold">
            3. Target Timeline
          </label>
          <select
            value={timeline}
            onChange={(e) => setTimeline(e.target.value)}
            className="w-full bg-background border border-border px-3.5 py-2.5 text-xs font-mono text-foreground focus:outline-none focus:border-primary"
          >
            {TIMELINES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ── 3. Name & Email ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label htmlFor="name" className="block text-xs font-mono uppercase tracking-widest text-foreground font-semibold">
            Your Name *
          </label>
          <input
            id="name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ada Lovelace"
            className="w-full bg-background border border-border px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="block text-xs font-mono uppercase tracking-widest text-foreground font-semibold">
            Email Address *
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ada@example.com"
            className="w-full bg-background border border-border px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      {/* ── 4. Project Brief / Description ──────────────────────────────────── */}
      <div className="space-y-2">
        <label htmlFor="description" className="block text-xs font-mono uppercase tracking-widest text-foreground font-semibold">
          Project Brief / Scope Details *
        </label>
        <textarea
          id="description"
          required
          rows={5}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe goals, deliverables, existing codebases or brand guidelines, and target launch dates..."
          className="w-full bg-background border border-border p-3.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary resize-y"
        />
      </div>

      {/* Bot Honeypot field (hidden from visual users) */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input
          id="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />
      </div>

      {/* Error Banner */}
      {errorMsg && (
        <div className="p-4 bg-red-500/10 border border-red-500/40 text-red-500 text-xs font-mono flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Submit Action */}
      <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-border/80">
        <div className="text-[11px] font-mono text-muted-foreground">
          🔒 Secure SSL transmission · Honeypot guarded · No spam
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={cn(
            "inline-flex items-center justify-center gap-2 px-6 py-3 text-xs font-mono uppercase tracking-widest transition-all",
            isSubmitting
              ? "bg-primary/50 text-primary-foreground cursor-wait"
              : "bg-primary text-primary-foreground font-bold hover:bg-primary/90 cursor-pointer shadow-md"
          )}
        >
          {isSubmitting ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              <span>Transmitting...</span>
            </>
          ) : (
            <>
              <span>Lock & Submit Brief</span>
              <Send className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
