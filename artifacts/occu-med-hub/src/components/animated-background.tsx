import { motion } from "framer-motion";

export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden" style={{ backgroundColor: 'hsl(28 20% 4%)' }}>

      {/* Faint warm grid */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: 'linear-gradient(rgba(230,180,0,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(230,180,0,0.3) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      {/* ── LARGE ANCHOR ORBS ── */}

      {/* Orb 1 — amber, top-left, dominant */}
      <motion.div
        className="absolute rounded-full"
        style={{
          top: '-20%',
          left: '-15%',
          width: '70%',
          height: '70%',
          background: 'radial-gradient(circle, rgba(230,155,0,0.45) 0%, rgba(230,120,0,0.22) 40%, transparent 70%)',
          filter: 'blur(80px)',
        }}
        animate={{ x: [0, 120, 40, 0], y: [0, 60, 120, 0], scale: [1, 1.15, 0.95, 1] }}
        transition={{ duration: 38, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Orb 2 — deep orange, bottom-right */}
      <motion.div
        className="absolute rounded-full"
        style={{
          bottom: '-25%',
          right: '-15%',
          width: '65%',
          height: '65%',
          background: 'radial-gradient(circle, rgba(228,114,0,0.40) 0%, rgba(230,155,0,0.18) 45%, transparent 70%)',
          filter: 'blur(90px)',
        }}
        animate={{ x: [0, -100, -40, 0], y: [0, -80, -130, 0], scale: [1, 1.2, 0.9, 1] }}
        transition={{ duration: 46, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Orb 3 — bright gold, center-right */}
      <motion.div
        className="absolute rounded-full"
        style={{
          top: '30%',
          right: '5%',
          width: '45%',
          height: '45%',
          background: 'radial-gradient(circle, rgba(230,204,0,0.35) 0%, rgba(230,180,0,0.15) 50%, transparent 70%)',
          filter: 'blur(100px)',
        }}
        animate={{ x: [0, -60, 20, 0], y: [0, 90, 30, 0] }}
        transition={{ duration: 52, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Orb 4 — vivid amber, center-left (small but intense) */}
      <motion.div
        className="absolute rounded-full"
        style={{
          top: '55%',
          left: '20%',
          width: '35%',
          height: '35%',
          background: 'radial-gradient(circle, rgba(232,227,55,0.30) 0%, rgba(230,180,0,0.12) 50%, transparent 70%)',
          filter: 'blur(70px)',
        }}
        animate={{ x: [0, 80, -20, 0], y: [0, -60, 20, 0] }}
        transition={{ duration: 42, repeat: Infinity, ease: "easeInOut", delay: 8 }}
      />

      {/* Orb 5 — orange-amber, top-center (drift) */}
      <motion.div
        className="absolute rounded-full"
        style={{
          top: '5%',
          left: '40%',
          width: '30%',
          height: '30%',
          background: 'radial-gradient(circle, rgba(230,155,0,0.28) 0%, rgba(228,114,0,0.10) 55%, transparent 70%)',
          filter: 'blur(60px)',
        }}
        animate={{ x: [0, -40, 60, 0], y: [0, 40, 10, 0] }}
        transition={{ duration: 35, repeat: Infinity, ease: "easeInOut", delay: 4 }}
      />

      {/* ── LIGHT STREAKS ── */}
      <motion.div
        className="absolute top-0 left-[-60%] w-[220%] h-[2px] transform -rotate-[30deg]"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(230,180,0,0.35) 50%, transparent 100%)',
          filter: 'blur(1px)',
        }}
        animate={{ y: [-200, 1400] }}
        transition={{ duration: 12, repeat: Infinity, ease: "linear", delay: 3 }}
      />
      <motion.div
        className="absolute top-0 right-[-60%] w-[220%] h-[1px] transform rotate-[25deg]"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(228,114,0,0.25) 50%, transparent 100%)',
          filter: 'blur(1px)',
        }}
        animate={{ y: [-200, 1400] }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear", delay: 9 }}
      />
      <motion.div
        className="absolute top-0 left-[-30%] w-[180%] h-[1px] transform -rotate-[15deg]"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(232,227,55,0.20) 50%, transparent 100%)',
          filter: 'blur(1px)',
        }}
        animate={{ y: [-200, 1400] }}
        transition={{ duration: 22, repeat: Infinity, ease: "linear", delay: 15 }}
      />

      {/* Scanline */}
      <div
        className="absolute inset-0 opacity-[0.025] mix-blend-overlay"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, #000 2px, #000 4px)',
          backgroundSize: '100% 4px'
        }}
      />
    </div>
  );
}
