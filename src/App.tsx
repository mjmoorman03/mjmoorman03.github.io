import { useEffect, useMemo, useRef, useState } from "react";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import Typography from "@mui/material/Typography";
import { keyframes } from "@mui/material/styles";
import Confetti from "react-confetti";

import bleachersImg from "./assets/bleachers.png";

type Phase = "idle" | "shaking" | "open";

const shakeRamp = keyframes`
  0% { transform: translate3d(0,0,0) rotate(0deg); }

  /* gentle start */
  8% { transform: translate3d(-0.5px, 0.5px, 0) rotate(-0.25deg); }
  16% { transform: translate3d(0.6px, -0.4px, 0) rotate(0.3deg); }
  24% { transform: translate3d(-0.8px, 0.4px, 0) rotate(-0.35deg); }

  /* building */
  32% { transform: translate3d(-1.2px, 1px, 0) rotate(0.55deg); }
  38% { transform: translate3d(1.6px, 0.2px, 0) rotate(-0.65deg); }
  44% { transform: translate3d(-1.4px, -1.2px, 0) rotate(0.7deg); }
  50% { transform: translate3d(1.8px, 1.4px, 0) rotate(-0.75deg); }

  /* fast + violent finish (denser keyframes) */
  56% { transform: translate3d(-2.2px, 1.6px, 0) rotate(0.95deg); }
  60% { transform: translate3d(2.6px, -0.4px, 0) rotate(-1.05deg); }
  64% { transform: translate3d(-2.8px, -1.8px, 0) rotate(1.2deg); }
  68% { transform: translate3d(2.4px, 2.1px, 0) rotate(-1.15deg); }
  72% { transform: translate3d(-3.2px, 1.2px, 0) rotate(1.35deg); }
  76% { transform: translate3d(3.0px, -2.2px, 0) rotate(-1.4deg); }
  80% { transform: translate3d(-2.6px, 2.6px, 0) rotate(1.45deg); }
  84% { transform: translate3d(3.4px, 1.1px, 0) rotate(-1.55deg); }
  88% { transform: translate3d(-3.6px, -2.4px, 0) rotate(1.6deg); }
  92% { transform: translate3d(3.1px, 2.9px, 0) rotate(-1.65deg); }
  96% { transform: translate3d(-2.8px, -3.2px, 0) rotate(1.55deg); }

  100% { transform: translate3d(0,0,0) rotate(0deg); }
`;

function getClickLabel(clickCount: number) {
  if (clickCount <= 0) return "click me";
  if (clickCount === 1) return "click me again";
  if (clickCount === 2) return "AGAIN!";

  const bangs = clickCount - 1;
  return `AGAIN${"!".repeat(bangs)}`;
}

function useWindowSize() {
  const [size, setSize] = useState(() => ({
    width: window.innerWidth,
    height: window.innerHeight,
  }));

  useEffect(() => {
    const onResize = () => {
      setSize({ width: window.innerWidth, height: window.innerHeight });
    };

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return size;
}

function Shoebox() {
  const [clickCount, setClickCount] = useState(0);
  const [phase, setPhase] = useState<Phase>("idle");
  const openTimerRef = useRef<number | null>(null);
  const [confettiOn, setConfettiOn] = useState(false);
  const confettiOffTimerRef = useRef<number | null>(null);
  const [vanishBox, setVanishBox] = useState(false);
  const vanishTimerRef = useRef<number | null>(null);
  const { width, height } = useWindowSize();

  const label = useMemo(() => getClickLabel(clickCount), [clickCount]);

  useEffect(() => {
    return () => {
      if (openTimerRef.current != null)
        window.clearTimeout(openTimerRef.current);
      if (confettiOffTimerRef.current != null)
        window.clearTimeout(confettiOffTimerRef.current);
      if (vanishTimerRef.current != null)
        window.clearTimeout(vanishTimerRef.current);
    };
  }, []);

  const onClick = () => {
    if (phase === "open") return;

    setClickCount((prev) => {
      const next = Math.min(15, prev + 1);

      if (next >= 15 && phase === "idle") {
        setPhase("shaking");
        if (openTimerRef.current != null)
          window.clearTimeout(openTimerRef.current);
        openTimerRef.current = window.setTimeout(() => {
          setPhase("open");
          setConfettiOn(true);
          if (confettiOffTimerRef.current != null)
            window.clearTimeout(confettiOffTimerRef.current);
          confettiOffTimerRef.current = window.setTimeout(() => {
            setConfettiOn(false);
          }, 4500);

          setVanishBox(false);
          if (vanishTimerRef.current != null)
            window.clearTimeout(vanishTimerRef.current);
          vanishTimerRef.current = window.setTimeout(() => {
            setVanishBox(true);
          }, 700);
        }, 3000);
      }

      return next;
    });
  };

  const isShaking = phase === "shaking";
  const isOpen = phase === "open";

  return (
    <Box
      sx={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 2,
      }}
    >
      <Confetti
        width={width}
        height={height}
        numberOfPieces={confettiOn ? 1300 : 0}
        recycle={false}
        gravity={0.18}
        initialVelocityX={9}
        initialVelocityY={18}
        tweenDuration={2000}
        run={confettiOn}
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 50,
        }}
      />

      <Box
        aria-hidden={!isOpen}
        sx={{
          position: "fixed",
          inset: 0,
          display: "grid",
          placeItems: "center",
          pointerEvents: "none",
          zIndex: 5,
          opacity: isOpen ? 1 : 0,
          transition: "opacity 500ms ease",
        }}
      >
        <Box
          component="img"
          alt="Bleachers"
          src={bleachersImg}
          sx={{
            width: "min(960px, 92vw)",
            maxHeight: "min(560px, 70vh)",
            objectFit: "contain",
            borderRadius: 4,
            boxShadow: "0 26px 90px rgba(0,0,0,0.45)",
            transform: isOpen
              ? "translateY(0) scale(1)"
              : "translateY(10px) scale(0.98)",
            transition: "transform 650ms cubic-bezier(0.18, 0.9, 0.2, 1.05)",
          }}
        />
      </Box>

      <Box
        role="button"
        tabIndex={0}
        aria-label="shoebox"
        onClick={onClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") onClick();
        }}
        sx={{
          position: "relative",
          width: { xs: 320, sm: 420 },
          height: { xs: 220, sm: 260 },
          cursor: isOpen ? "default" : "pointer",
          outline: "none",
          userSelect: "none",
          transformStyle: "preserve-3d",
          perspective: 900,
          animation: isShaking ? `${shakeRamp} 3000ms linear both` : "none",
          opacity: vanishBox ? 0 : 1,
          transform: vanishBox ? "translateY(18px) scale(0.05)" : undefined,
          transition: vanishBox
            ? "transform 620ms ease, opacity 620ms ease"
            : "transform 240ms ease",
          "&:active": isOpen ? undefined : { transform: "scale(0.99)" },
          pointerEvents: vanishBox ? "none" : undefined,
        }}
      >
        {/* base */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            top: { xs: 42, sm: 48 },
            borderRadius: 4,
            background:
              "linear-gradient(145deg, rgba(216, 181, 129, 1) 0%, rgba(191, 147, 92, 1) 45%, rgba(162, 113, 62, 1) 100%)",
            boxShadow: "0 24px 70px rgba(0,0,0,0.35)",
            overflow: "hidden",
          }}
        >
          {/* subtle inner shadow */}
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(120% 90% at 50% 10%, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0) 55%)",
              pointerEvents: "none",
            }}
          />

          {/* image reveal */}
          <Box
            sx={{
              position: "absolute",
              inset: 10,
              borderRadius: 3,
              overflow: "hidden",
              background: "rgba(10, 10, 10, 0.28)",
              display: "grid",
              placeItems: "center",
              opacity: 0,
            }}
          >
            <Box
              component="img"
              alt="Bleachers"
              src={bleachersImg}
              sx={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                filter: "saturate(1.05) contrast(1.05)",
              }}
            />
          </Box>
        </Box>

        {/* lid */}
        <Box
          sx={{
            position: "absolute",
            left: -10,
            right: -10,
            top: 18,
            height: { xs: 78, sm: 86 },
            borderRadius: 4,
            background:
              "linear-gradient(145deg, rgba(231, 197, 146, 1) 0%, rgba(205, 162, 107, 1) 55%, rgba(173, 125, 73, 1) 100%)",
            boxShadow: "0 18px 35px rgba(0,0,0,0.25)",
            transformOrigin: "18% 90%",
            transform: isOpen
              ? "rotateX(68deg) translate3d(0, -40px, 10px)"
              : "rotateX(0deg)",
            transition: isShaking
              ? "transform 320ms ease"
              : "transform 780ms cubic-bezier(0.18, 0.9, 0.2, 1.05)",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              borderRadius: 4,
              background:
                "radial-gradient(120% 120% at 20% 20%, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0) 55%)",
              pointerEvents: "none",
            }}
          />
        </Box>
      </Box>

      <Typography
        sx={{
          fontFamily:
            'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"',
          fontWeight: 900,
          letterSpacing: 1.4,
          textTransform: "uppercase",
          color: "rgba(0, 0, 0, 0.78)",
          textShadow:
            "0 1px 0 rgba(255,255,255,0.20), 0 14px 40px rgba(0,0,0,0.22)",
          fontSize: { xs: 18, sm: 22 },
          px: 2,
          textAlign: "center",
          opacity: isOpen ? 0 : 1,
          transform: isOpen ? "translateY(-6px)" : "translateY(0)",
          transition: "opacity 380ms ease, transform 380ms ease",
          pointerEvents: "none",
        }}
      >
        {label}
      </Typography>
    </Box>
  );
}

function App() {
  return (
    <>
      <CssBaseline />
      <Box
        sx={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          px: 2,
          background:
            "linear-gradient(to top right,rgb(47, 89, 52) 0%,rgb(87, 164, 114) 45%,rgb(150, 214, 159) 75%,rgb(178, 233, 193) 100%)",
        }}
      >
        <Shoebox />
      </Box>
    </>
  );
}

export default App;
