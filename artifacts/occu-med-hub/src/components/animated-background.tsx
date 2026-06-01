import { motion } from "framer-motion";

export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden" style={{ backgroundColor: "#00233a" }}>
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(135deg, #00233a 0%, #003f22 42%, #00594f 76%, #0cac9f 100%)",
        }}
      />

      <motion.div
        className="absolute rounded-full mix-blend-screen"
        style={{
          top: "-16%",
          left: "-10%",
          width: "64%",
          height: "64%",
          background: "radial-gradient(circle, rgba(18,173,165,0.72) 0%, rgba(0,166,121,0.42) 34%, transparent 70%)",
          filter: "blur(72px)",
        }}
        animate={{ x: [0, 90, 30, 0], y: [0, 48, 100, 0], scale: [1, 1.16, 0.96, 1], opacity: [0.78, 1, 0.82, 0.78] }}
        transition={{ duration: 34, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="absolute rounded-full mix-blend-screen"
        style={{
          bottom: "-20%",
          right: "-12%",
          width: "68%",
          height: "68%",
          background: "radial-gradient(circle, rgba(150,238,0,0.58) 0%, rgba(101,187,153,0.36) 38%, transparent 72%)",
          filter: "blur(82px)",
        }}
        animate={{ x: [0, -92, -28, 0], y: [0, -74, -118, 0], scale: [1, 1.18, 0.94, 1], opacity: [0.66, 0.96, 0.72, 0.66] }}
        transition={{ duration: 44, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="absolute rounded-full mix-blend-screen"
        style={{
          top: "24%",
          right: "4%",
          width: "48%",
          height: "48%",
          background: "radial-gradient(circle, rgba(18,173,165,0.52) 0%, rgba(0,166,121,0.30) 44%, transparent 74%)",
          filter: "blur(86px)",
        }}
        animate={{ x: [0, -48, 26, 0], y: [0, 80, 22, 0], scale: [1, 0.95, 1.12, 1], opacity: [0.58, 0.90, 0.66, 0.58] }}
        transition={{ duration: 50, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="absolute rounded-full mix-blend-screen"
        style={{
          top: "52%",
          left: "16%",
          width: "40%",
          height: "40%",
          background: "radial-gradient(circle, rgba(216,248,232,0.30) 0%, rgba(101,187,153,0.24) 46%, transparent 72%)",
          filter: "blur(70px)",
        }}
        animate={{ x: [0, 74, -18, 0], y: [0, -52, 18, 0], scale: [0.96, 1.12, 1, 0.96], opacity: [0.48, 0.82, 0.58, 0.48] }}
        transition={{ duration: 40, repeat: Infinity, ease: "easeInOut", delay: 6 }}
      />

      <motion.div
        className="absolute rounded-full mix-blend-screen"
        style={{
          top: "2%",
          left: "38%",
          width: "34%",
          height: "34%",
          background: "radial-gradient(circle, rgba(150,238,0,0.44) 0%, rgba(18,173,165,0.24) 52%, transparent 74%)",
          filter: "blur(60px)",
        }}
        animate={{ x: [0, -36, 56, 0], y: [0, 36, 10, 0], scale: [1, 1.18, 0.98, 1], opacity: [0.46, 0.82, 0.54, 0.46] }}
        transition={{ duration: 36, repeat: Infinity, ease: "easeInOut", delay: 3 }}
      />

      <div
        className="absolute inset-0 opacity-40"
        style={{
          background: "radial-gradient(circle at 50% 42%, rgba(0,35,58,0) 0%, rgba(0,20,24,0.18) 58%, rgba(0,0,0,0.36) 100%)",
        }}
      />

      <div
        className="absolute inset-0 opacity-[0.012] mix-blend-overlay"
        style={{
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, #000 2px, #000 4px)",
          backgroundSize: "100% 4px",
        }}
      />
    </div>
  );
}
