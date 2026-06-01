import { motion } from "framer-motion";

export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden" style={{ backgroundColor: '#00233a' }}>
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, #00233a 0%, #003f22 42%, #00594f 76%, #0cac9f 100%)',
        }}
      />

      {/* Floating pulsing light orbs — teal/lime palette */}
      <motion.div
        className="absolute rounded-full"
        style={{
          top: '-18%',
          left: '-12%',
          width: '58%',
          height: '58%',
          background: 'radial-gradient(circle, rgba(18,173,165,0.42) 0%, rgba(0,89,79,0.24) 42%, transparent 72%)',
          filter: 'blur(95px)',
        }}
        animate={{ x: [0, 90, 30, 0], y: [0, 48, 100, 0], scale: [1, 1.16, 0.96, 1], opacity: [0.68, 0.98, 0.78, 0.68] }}
        transition={{ duration: 34, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="absolute rounded-full"
        style={{
          bottom: '-22%',
          right: '-14%',
          width: '62%',
          height: '62%',
          background: 'radial-gradient(circle, rgba(150,238,0,0.34) 0%, rgba(101,187,153,0.22) 44%, transparent 74%)',
          filter: 'blur(105px)',
        }}
        animate={{ x: [0, -92, -28, 0], y: [0, -74, -118, 0], scale: [1, 1.18, 0.94, 1], opacity: [0.54, 0.88, 0.64, 0.54] }}
        transition={{ duration: 44, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="absolute rounded-full"
        style={{
          top: '28%',
          right: '6%',
          width: '42%',
          height: '42%',
          background: 'radial-gradient(circle, rgba(18,173,165,0.32) 0%, rgba(0,166,121,0.18) 48%, transparent 74%)',
          filter: 'blur(110px)',
        }}
        animate={{ x: [0, -48, 26, 0], y: [0, 80, 22, 0], scale: [1, 0.95, 1.12, 1], opacity: [0.48, 0.78, 0.58, 0.48] }}
        transition={{ duration: 50, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="absolute rounded-full"
        style={{
          top: '54%',
          left: '18%',
          width: '34%',
          height: '34%',
          background: 'radial-gradient(circle, rgba(236,230,151,0.24) 0%, rgba(101,187,153,0.16) 48%, transparent 72%)',
          filter: 'blur(82px)',
        }}
        animate={{ x: [0, 74, -18, 0], y: [0, -52, 18, 0], scale: [0.96, 1.12, 1, 0.96], opacity: [0.40, 0.76, 0.52, 0.40] }}
        transition={{ duration: 40, repeat: Infinity, ease: "easeInOut", delay: 6 }}
      />

      <motion.div
        className="absolute rounded-full"
        style={{
          top: '4%',
          left: '40%',
          width: '28%',
          height: '28%',
          background: 'radial-gradient(circle, rgba(150,238,0,0.26) 0%, rgba(18,173,165,0.12) 55%, transparent 74%)',
          filter: 'blur(72px)',
        }}
        animate={{ x: [0, -36, 56, 0], y: [0, 36, 10, 0], scale: [1, 1.18, 0.98, 1], opacity: [0.38, 0.72, 0.46, 0.38] }}
        transition={{ duration: 36, repeat: Infinity, ease: "easeInOut", delay: 3 }}
      />

      {/* Soft depth haze, no yellow streak/grid */}
      <div
        className="absolute inset-0 opacity-60"
        style={{
          background: 'radial-gradient(circle at 50% 42%, rgba(0,35,58,0) 0%, rgba(0,20,24,0.28) 54%, rgba(0,0,0,0.52) 100%)',
        }}
      />

      <div
        className="absolute inset-0 opacity-[0.018] mix-blend-overlay"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, #000 2px, #000 4px)',
          backgroundSize: '100% 4px',
        }}
      />
    </div>
  );
}
