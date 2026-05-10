"use client";
import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Lenis from "lenis";

const words = [
  { text: "design.", hue: 0 },
  { text: "prototype.", hue: 30 },
  { text: "solve.", hue: 60 },
  { text: "build.", hue: 90 },
  { text: "develop.", hue: 120 },
  { text: "debug.", hue: 150 },
  { text: "learn.", hue: 180 },
  { text: "ship.", hue: 210 },
  { text: "create.", hue: 240 },
  { text: "inspire.", hue: 270 },
  { text: "innovate.", hue: 300 },
  { text: "do it.", hue: 330 },
];

export default function Page() {
  const [activeIndex, setActiveIndex] = useState(0);
  const listRef = useRef<HTMLUListElement>(null);
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.08, smoothWheel: true });
    lenisRef.current = lenis;
    const raf = (time: number) => { lenis.raf(time); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
    return () => lenis.destroy();
  }, []);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const handleScroll = () => {
      const items = list.querySelectorAll("li");
      const centerY = window.innerHeight / 2;
      let closest = 0;
      let closestDist = Infinity;
      items.forEach((el, i) => {
        const rect = el.getBoundingClientRect();
        const itemCenter = rect.top + rect.height / 2;
        const dist = Math.abs(itemCenter - centerY);
        if (dist < closestDist) { closestDist = dist; closest = i; }
      });
      setActiveIndex(closest);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const fontSize = "clamp(3.5rem, 8vw, 7rem)";
  const fontStyle = {
    fontFamily: "Inter, SF Pro Display, sans-serif",
    letterSpacing: "-0.06em",
    fontWeight: 900,
    lineHeight: 1.25,
  };

  return (
    <div
      className="relative bg-black text-white"
      style={{ scrollSnapType: "y proximity" }}
    >
      {/* Grid background */}
      <div
        className="fixed inset-0 pointer-events-none -z-10"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)
          `,
          backgroundSize: "44px 44px",
          maskImage: "linear-gradient(-20deg, transparent 40%, white)",
        }}
      />
      <div
        className="fixed top-20 left-20 w-[500px] h-[500px] rounded-full -z-10"
        style={{ background: "rgba(255,255,255,0.05)", filter: "blur(120px)" }}
      />

      {/* Intro */}
      <div className="min-h-screen flex items-center px-20">
        <h1
          style={{
            ...fontStyle,
            fontSize: "clamp(4rem,10vw,8rem)",
            lineHeight: 0.8,
            background: "linear-gradient(to bottom, #fff 60%, rgba(255,255,255,0.35))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          you can<br />scroll.
        </h1>
      </div>

      {/* Main section — flex row, h2 sticky, ul scrolls past */}
      <section
        style={{
          display: "flex",
          width: "100%",
          paddingLeft: "5rem",
          fontSize,
          lineHeight: 1.25,
        }}
      >
        {/* Sticky "you can" — sticks at vertical center using 0.5lh offset */}
        <h2
          style={{
            position: "sticky",
            top: "calc(50% - 0.625lh)", // 0.5 * lineHeight(1.25) = 0.625
            fontSize: "inherit",
            margin: 0,
            display: "inline-block",
            height: "fit-content",
            whiteSpace: "nowrap",
            ...fontStyle,
            lineHeight: 1.25,
            background: "linear-gradient(to bottom, #fff 50%, rgba(255,255,255,0.25))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            flexShrink: 0,
            paddingRight: "0.3em",
          }}
        >
          you can&nbsp;
        </h2>

        {/* Word list — tight, natural flow, scrolls past sticky h2 */}
        <ul
          ref={listRef}
          style={{
            listStyle: "none",
            padding: 0,
            margin: 0,
            fontWeight: 900,
          }}
        >
          {words.map((word, i) => {
            const isActive = i === activeIndex;
            return (
              <motion.li
                key={i}
                style={{
                  scrollSnapAlign: "center",
                  ...fontStyle,
                  fontSize,
                }}
                animate={{
                  opacity: isActive ? 1 : 0.15,
                  color: isActive
                    ? `oklch(72% 0.28 ${word.hue})`
                    : "#ffffff",
                }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                {word.text}
              </motion.li>
            );
          })}
        </ul>
      </section>

      {/* Outro */}
      <div className="min-h-screen flex items-center justify-center">
        <h2
          style={{
            ...fontStyle,
            fontSize: "clamp(4rem,10vw,8rem)",
            background: "linear-gradient(to bottom, #fff 50%, rgba(255,255,255,0.25))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          fin.
        </h2>
      </div>
    </div>
  );
}