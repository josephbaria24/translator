import { useState, useCallback, useRef, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Copy,
  RotateCcw,
  ArrowDownUp,
  Zap,
  Volume2,
  VolumeX,
} from "lucide-react";
import { translateToAlien, translateToNormal } from "@/lib/translator";
import { cn } from "@/lib/utils";

// Animated glitch text effect for the title
function GlitchTitle({ text }: { text: string }) {
  return (
    <h1
      className="glitch-title text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-black tracking-widest uppercase text-center select-none"
      data-text={text}
    >
      {text}
    </h1>
  );
}

// Scanline overlay component for the output panel
function ScanlinePanel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("relative scanline-container rounded-lg overflow-hidden", className)}>
      {children}
      <div className="scanlines pointer-events-none" />
    </div>
  );
}

// Animated "alien signal" dots
function SignalDots() {
  return (
    <div className="flex gap-1.5 items-center">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="signal-dot"
          style={{ animationDelay: `${i * 0.3}s` }}
        />
      ))}
    </div>
  );
}

export default function Home() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [useVariants, setUseVariants] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [direction, setDirection] = useState<"toAlien" | "toNormal">("toAlien");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio and handle autoplay fallback mount
  useEffect(() => {
    audioRef.current = new Audio("/fah.mp3");

    let hasPlayed = false;
    const attemptPlay = () => {
      if (!isMuted && audioRef.current && !hasPlayed) {
        audioRef.current.play()
          .then(() => {
            hasPlayed = true;
            // Clean up listener once played
            window.removeEventListener("click", attemptPlay);
            window.removeEventListener("keydown", attemptPlay);
          })
          .catch(() => {
            // Still blocked or failed
          });
      }
    };

    // Initial attempt
    attemptPlay();

    // Interaction fallbacks
    window.addEventListener("click", attemptPlay);
    window.addEventListener("keydown", attemptPlay);

    return () => {
      window.removeEventListener("click", attemptPlay);
      window.removeEventListener("keydown", attemptPlay);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [isMuted]); // Re-run if mute state changes while waiting

  const playSound = useCallback(() => {
    if (!isMuted && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => { });
    }
  }, [isMuted]);
  const outputRef = useRef<HTMLDivElement>(null);
  const copiedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Flash animation on output when result arrives
  const [flashOutput, setFlashOutput] = useState(false);

  const runTranslate = useCallback(
    (dir: "toAlien" | "toNormal", text: string, variants: boolean) => {
      if (!text.trim()) return;
      setIsTranslating(true);
      setTimeout(() => {
        const result =
          dir === "toAlien"
            ? translateToAlien(text, variants)
            : translateToNormal(text);
        setOutput(result);
        setIsTranslating(false);
        setFlashOutput(true);
        playSound();
        setTimeout(() => setFlashOutput(false), 500);
      }, 120);
    },
    []
  );

  const handleToAlien = () => {
    setDirection("toAlien");
    runTranslate("toAlien", input, useVariants);
  };

  const handleToNormal = () => {
    setDirection("toNormal");
    runTranslate("toNormal", input, useVariants);
  };

  const handleCopy = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
      copiedTimerRef.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleClear = () => {
    setInput("");
    setOutput("");
    setCopied(false);
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
    };
  }, []);

  return (
    <div className="decoder-bg min-h-screen flex flex-col items-center justify-start py-4 px-4">
      {/* Ambient orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      {/* Card */}
      <div className="decoder-card w-full max-w-2xl relative z-10">
        {/* Header */}
        <div className="card-header px-8 pt-8 pb-6 border-b border-white/5 relative overflow-visible">
          {/* Top-left baby */}
          <div className="absolute top-10 left-0 sm:-left-6 transform -translate-y-1/2 z-20">
            <img src="/baby.png" alt="Baby" className="w-16 sm:w-20 lg:w-24 h-auto" />
          </div>

          {/* Top-right meme */}
          <div className="absolute top-10 right-0 sm:-right-6 transform -translate-y-1/2 z-20">
            <img src="/meme.png" alt="Meme" className="w-16 sm:w-20 lg:w-24 h-auto" />
          </div>

          <div className="flex flex-col items-center justify-center mb-2 relative">
            <GlitchTitle text="Nigger Translator" />

            {/* Mute toggle button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMuted(!isMuted)}
              className="absolute top-0 right-0 sm:right-[-4rem] text-slate-500 hover:text-cyan-400 transition-colors"
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </Button>
          </div>

          <div className="flex items-center justify-center gap-2 mt-0">
            <SignalDots />
            <span className="text-xs text-slate-500 font-mono">
              NIGGA ALIEN ACTIVE
            </span>
            <SignalDots />
          </div>
        </div>

        {/* Body */}
        <div className="px-8 py-7 flex flex-col gap-6">
          {/* Disclaimer */}
          <div className="disclaimer-banner px-4 py-2 rounded-md text-center">
            <span className="text-xs font-mono text-amber-400/80 tracking-wide">
              ⚠ A fucking translator.
            </span>
          </div>

          {/* Input */}
          <div className="flex flex-col gap-2">
            <Label
              htmlFor="input-text"
              className="text-xs font-mono uppercase tracking-widest text-slate-400"
            >
              Input Signal
            </Label>
            <Textarea
              id="input-text"
              data-testid="input-text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter text to encode or decode..."
              className="input-field min-h-[110px] resize-none font-mono text-sm"
            />
          </div>

          {/* Controls row */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              data-testid="button-to-alien"
              onClick={handleToAlien}
              disabled={!input.trim()}
              className="btn-primary flex-1 font-mono uppercase tracking-widest text-xs gap-2"
            >
              <Zap className="w-3.5 h-3.5" />
              Translate to Alien
            </Button>
            <Button
              data-testid="button-to-normal"
              onClick={handleToNormal}
              disabled={!input.trim()}
              variant="outline"
              className="btn-secondary flex-1 font-mono uppercase tracking-widest text-xs gap-2"
            >
              <ArrowDownUp className="w-3.5 h-3.5" />
              Translate to Normal
            </Button>
          </div>

          {/* Variant Toggle */}
          <div className="variant-row flex items-center justify-between px-4 py-3 rounded-lg">
            <div className="flex flex-col gap-0.5">
              <Label
                htmlFor="variant-toggle"
                className="text-xs font-mono uppercase tracking-widest text-slate-300 cursor-pointer"
              >
                Random Variants
              </Label>
              <span className="text-[11px] text-slate-500 font-mono">
                {useVariants
                  ? "Variant mode ON — outputs will differ each run"
                  : "Variant mode OFF — deterministic output"}
              </span>
            </div>
            <Switch
              id="variant-toggle"
              data-testid="toggle-variants"
              checked={useVariants}
              onCheckedChange={setUseVariants}
              className="data-[state=checked]:bg-cyan-500"
            />
          </div>

          {/* Output */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-mono uppercase tracking-widest text-slate-400">
                Decoded Output
              </Label>
              {output && (
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                  {direction === "toAlien" ? "→ Alien" : "→ English"}
                </span>
              )}
            </div>
            <ScanlinePanel>
              <div
                ref={outputRef}
                data-testid="output-panel"
                className={cn(
                  "output-panel min-h-[110px] p-4 rounded-lg font-mono text-sm break-all transition-all duration-300",
                  flashOutput && "flash-output",
                  isTranslating && "opacity-50"
                )}
              >
                {isTranslating ? (
                  <span className="text-cyan-400/50 animate-pulse tracking-widest">
                    DECODING...
                  </span>
                ) : output ? (
                  <span className={cn(
                    "leading-relaxed",
                    direction === "toAlien" ? "text-cyan-300" : "text-emerald-300"
                  )}>
                    {output}
                  </span>
                ) : (
                  <span className="text-slate-600 select-none">
                    Output will appear here...
                  </span>
                )}
              </div>
            </ScanlinePanel>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <Button
              data-testid="button-copy"
              onClick={handleCopy}
              disabled={!output}
              variant="outline"
              className="btn-copy flex-1 font-mono uppercase tracking-widest text-xs gap-2 transition-all duration-200"
            >
              <Copy className="w-3.5 h-3.5" />
              {copied ? "Copied!" : "Copy Output"}
            </Button>
            <Button
              data-testid="button-clear"
              onClick={handleClear}
              variant="ghost"
              className="btn-ghost flex-1 font-mono uppercase tracking-widest text-xs gap-2"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Clear
            </Button>
          </div>

          {/* Copied confirmation */}
          <div
            className={cn(
              "text-center text-xs font-mono text-emerald-400 tracking-widest uppercase transition-all duration-300",
              copied ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1 pointer-events-none"
            )}
            data-testid="text-copied-message"
          >
            ✓ Output copied to clipboard
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 pb-6 pt-2 border-t border-white/5 text-center">
          <p className="text-[10px] font-mono text-slate-600 tracking-widest uppercase">
            Xenolinguistic Protocol 7 &mdash; Authorized Use Only
          </p>

        </div>
      </div>
    </div>
  );
}
