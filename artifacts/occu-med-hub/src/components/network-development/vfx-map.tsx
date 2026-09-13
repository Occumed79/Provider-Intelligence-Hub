import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ComposableMap,
  Geographies,
  Geography,
  Line,
  Marker,
  ZoomableGroup,
} from "react-simple-maps";
import { Pause, Play, RadioTower, RotateCcw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const WORLD_GEO = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";
const OCCUMED_HQ: [number, number] = [-119.7871, 36.7378];

type NetworkProvider = {
  id: number;
  clinicName?: string | null;
  city?: string | null;
  state?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  createdAt?: string | null;
};

type Props = {
  providers: NetworkProvider[];
  activeProviderIds: Set<number>;
  rangeLabel: string;
  loading?: boolean;
};

function safeText(value: unknown, fallback = "") {
  const text = String(value ?? "").trim();
  return text || fallback;
}

function validCoord(provider: NetworkProvider) {
  const lat = Number(provider.latitude);
  const lon = Number(provider.longitude);
  return Number.isFinite(lat) && Number.isFinite(lon) && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
}

function providerDate(provider: NetworkProvider) {
  const stamp = provider.createdAt ? new Date(provider.createdAt).getTime() : Number.NaN;
  return Number.isFinite(stamp) ? stamp : 0;
}

export function NetworkVfxMap({ providers, activeProviderIds, rangeLabel, loading = false }: Props) {
  const reducedMotion = useReducedMotion();
  const [playing, setPlaying] = useState(false);
  const [cursor, setCursor] = useState(100);

  const mapped = useMemo(() => providers.filter(validCoord).slice(0, 1400), [providers]);
  const activations = useMemo(
    () => mapped.filter((provider) => activeProviderIds.has(provider.id)).sort((a, b) => providerDate(a) - providerDate(b)),
    [mapped, activeProviderIds],
  );
  const visibleCount = Math.round((cursor / 100) * activations.length);
  const visibleIds = useMemo(() => new Set(activations.slice(0, visibleCount).map((provider) => provider.id)), [activations, visibleCount]);
  const latest = visibleCount > 0 ? activations[Math.min(visibleCount - 1, activations.length - 1)] : null;
  const arcProviders = activations.slice(0, visibleCount).slice(-22);
  const recentPulseIds = useMemo(() => new Set(activations.slice(Math.max(0, visibleCount - 6), visibleCount).map((provider) => provider.id)), [activations, visibleCount]);

  useEffect(() => {
    if (!playing || reducedMotion) return;
    const timer = window.setInterval(() => {
      setCursor((value) => {
        if (value >= 100) {
          setPlaying(false);
          return 100;
        }
        return Math.min(100, value + 1.4);
      });
    }, 80);
    return () => window.clearInterval(timer);
  }, [playing, reducedMotion]);

  const resetPlayback = () => {
    setPlaying(false);
    setCursor(0);
  };

  const togglePlayback = () => {
    if (cursor >= 100) setCursor(0);
    setPlaying((value) => !value);
  };

  return (
    <div className="relative min-h-[560px] overflow-hidden bg-[#050708]">
      <style>{`
        @keyframes ndhArcFlow { to { stroke-dashoffset: -28; } }
        @keyframes ndhScan { 0% { transform: translateY(-14%); opacity: 0; } 18% { opacity: .45; } 82% { opacity: .16; } 100% { transform: translateY(114%); opacity: 0; } }
        .ndh-flow-arc { animation: ndhArcFlow 2.8s linear infinite; }
        .ndh-scanline { animation: ndhScan 7s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) { .ndh-flow-arc, .ndh-scanline { animation: none !important; } }
      `}</style>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_46%,rgba(18,173,165,.15),transparent_38%),radial-gradient(circle_at_22%_72%,rgba(230,180,0,.08),transparent_28%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-35" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.025) 1px, transparent 1px)", backgroundSize: "42px 42px" }} />
      <div className="ndh-scanline pointer-events-none absolute left-0 right-0 top-0 z-10 h-24 bg-gradient-to-b from-transparent via-primary/10 to-transparent blur-xl" />

      <div className="absolute left-5 top-5 z-20 max-w-[300px] rounded-xl border border-white/10 bg-black/65 px-4 py-3 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.22em] text-primary">
          <RadioTower className="h-3.5 w-3.5" /> Network signal
        </div>
        <div className="mt-1.5 flex items-end gap-2">
          <span className="text-2xl font-black text-white">{mapped.length.toLocaleString()}</span>
          <span className="pb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">mapped providers</span>
        </div>
        <div className="mt-2 text-[11px] leading-4 text-white/65">
          {latest ? <><span className="text-white">{safeText(latest.clinicName, `Provider #${latest.id}`)}</span><br />{[safeText(latest.city), safeText(latest.state)].filter(Boolean).join(", ") || "Location captured"}</> : `${activations.length} activations in ${rangeLabel}`}
        </div>
      </div>

      <div className="absolute right-5 top-5 z-20 hidden rounded-xl border border-white/10 bg-black/60 px-4 py-3 backdrop-blur-xl md:block">
        <div className="flex gap-4 text-[9px] font-black uppercase tracking-wider text-muted-foreground">
          <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-white/35" /> Existing</span>
          <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-primary shadow-[0_0_12px_rgba(18,173,165,.9)]" /> Activated</span>
          <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#e6b400] shadow-[0_0_12px_rgba(230,180,0,.8)]" /> HQ</span>
        </div>
      </div>

      {loading ? (
        <div className="absolute inset-0 z-20 flex items-center justify-center text-sm text-muted-foreground">Loading network geometry…</div>
      ) : (
        <ComposableMap projection="geoEqualEarth" projectionConfig={{ scale: 150 }} width={960} height={520} className="relative z-[2] h-[520px] w-full select-none">
          <defs>
            <filter id="ndhGlow" x="-300%" y="-300%" width="700%" height="700%">
              <feGaussianBlur stdDeviation="2.4" result="coloredBlur" />
              <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <filter id="ndhStrongGlow" x="-400%" y="-400%" width="900%" height="900%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>
          <ZoomableGroup minZoom={1} maxZoom={5}>
            <Geographies geography={WORLD_GEO}>
              {({ geographies }) => geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill="rgba(255,255,255,.035)"
                  stroke="rgba(255,255,255,.085)"
                  strokeWidth={0.45}
                  style={{ default: { outline: "none" }, hover: { outline: "none", fill: "rgba(18,173,165,.075)" }, pressed: { outline: "none" } }}
                />
              ))}
            </Geographies>

            {arcProviders.map((provider) => (
              <Line
                key={`arc-${provider.id}`}
                from={OCCUMED_HQ}
                to={[Number(provider.longitude), Number(provider.latitude)]}
                stroke="rgba(18,173,165,.72)"
                strokeWidth={0.8}
                strokeLinecap="round"
                strokeDasharray="4 10"
                className="ndh-flow-arc"
                filter="url(#ndhGlow)"
              />
            ))}

            <Marker coordinates={OCCUMED_HQ}>
              <motion.circle r={reducedMotion ? 5 : 7} fill="rgba(230,180,0,.14)" stroke="rgba(230,180,0,.9)" strokeWidth={1.1} filter="url(#ndhStrongGlow)" animate={reducedMotion ? undefined : { r: [5, 10, 5], opacity: [1, .35, 1] }} transition={{ duration: 2.8, repeat: Infinity }} />
              <circle r={2.4} fill="#e6b400" />
              <title>Occu-Med HQ — Fresno, California</title>
            </Marker>

            {mapped.map((provider) => {
              const isActivation = activeProviderIds.has(provider.id);
              const isVisibleActivation = visibleIds.has(provider.id);
              const recentPulse = recentPulseIds.has(provider.id);
              if (isActivation && !isVisibleActivation) return null;
              return (
                <Marker key={provider.id} coordinates={[Number(provider.longitude), Number(provider.latitude)]}>
                  <title>{safeText(provider.clinicName, `Provider #${provider.id}`)}</title>
                  {recentPulse && (
                    <motion.circle
                      r={4}
                      fill="transparent"
                      stroke="rgba(18,173,165,.9)"
                      strokeWidth={1}
                      initial={{ r: 3, opacity: .9 }}
                      animate={reducedMotion ? undefined : { r: [3, 16, 24], opacity: [.9, .25, 0] }}
                      transition={{ duration: 2.5, repeat: Infinity, delay: (provider.id % 7) * .11 }}
                      filter="url(#ndhGlow)"
                    />
                  )}
                  <circle
                    r={isActivation ? 2.9 : 1.45}
                    fill={isActivation ? "rgb(18,173,165)" : "rgba(255,255,255,.34)"}
                    stroke={isActivation ? "rgba(255,255,255,.88)" : "transparent"}
                    strokeWidth={isActivation ? .45 : 0}
                    filter={isActivation ? "url(#ndhGlow)" : undefined}
                  />
                </Marker>
              );
            })}
          </ZoomableGroup>
        </ComposableMap>
      )}

      <div className="absolute bottom-4 left-4 right-4 z-20 rounded-2xl border border-white/10 bg-black/72 p-4 shadow-2xl backdrop-blur-2xl">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="flex items-center gap-2">
            <Button size="icon" variant="outline" onClick={togglePlayback} disabled={!activations.length || Boolean(reducedMotion)} className="h-9 w-9 border-primary/25 bg-primary/5 text-primary hover:bg-primary/10">
              {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <Button size="icon" variant="ghost" onClick={resetPlayback} className="h-9 w-9 text-muted-foreground hover:text-white"><RotateCcw className="h-4 w-4" /></Button>
          </div>
          <div className="flex-1">
            <div className="mb-2 flex items-center justify-between gap-3 text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">
              <span className="flex items-center gap-2"><Sparkles className="h-3 w-3 text-primary" /> Expansion playback</span>
              <span>{visibleCount} / {activations.length} activations</span>
            </div>
            <input
              aria-label="Expansion playback progress"
              type="range"
              min="0"
              max="100"
              step="1"
              value={cursor}
              onChange={(event) => { setPlaying(false); setCursor(Number(event.target.value)); }}
              className="h-1.5 w-full cursor-pointer accent-[rgb(18,173,165)]"
            />
          </div>
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={`${latest?.id ?? "none"}-${visibleCount}`} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-2 text-[10px] text-muted-foreground">
            Signal lines are a schematic visualization of network activation from Occu-Med HQ; they do not represent patient travel routes.
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
