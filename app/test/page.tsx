"use client";

import React, { useRef ,useEffect} from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const words = [
  "Dreams", "Travels", "Wins", "Creates",
  "Dreams", "Travels", "Wins", "Creates",
  "Dreams", "Travels", "Wins", "Creates",
];

function WordSection({
  word,
  containerRef,
}: {
  word: string;
  containerRef: React.RefObject<HTMLDivElement>;
}) {
  const ref = useRef(null);

  const { scrollYProgress } = useScroll({
    container: containerRef,  // ← tell framer to track scroll inside the div
    target: ref,
    offset: ["start center", "end center"],
  });

  const opacity = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [0.2, 1, 0.2]
  );

  return (
    <section
      ref={ref}
      className="h-screen snap-center flex items-center"
    >
      <div className="h-[25vh] flex items-center">
        <motion.h1
          style={{
            opacity,
            fontFamily: "Inter, SF Pro Display, Helvetica Neue, sans-serif",
          }}
          className="text-[5rem] md:text-[8rem] font-black uppercase tracking-[-0.08em] text-white leading-none"
        >
          {word}
        </motion.h1>
      </div>
    </section>
  );
}

export default function Page() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.style.height = "100vh";
    document.body.style.overflowY = "scroll";
    document.body.style.scrollSnapType = "y mandatory";
    document.documentElement.style.height = "100vh";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.height = "";
      document.body.style.overflowY = "";
      document.body.style.scrollSnapType = "";
      document.documentElement.style.height = "";
      document.documentElement.style.overflow = "";
    };
  }, []);

  return (
    // plain div, no scroll/snap classes
    <div ref={containerRef}>
      <section className="min-h-screen snap-start bg-red-600 flex items-center">
        <h2 className="text-6xl font-bold text-white pl-20">Hey</h2>
      </section>

      <section className="snap-start bg-[#0a0a0a] flex text-white relative min-h-screen">
        <div className="pointer-events-none sticky top-0 h-screen flex items-center pl-20 w-[40vw] shrink-0">
          <div className="flex items-center">
            <h1 className="text-[5rem] font-black leading-none tracking-[-0.08em] uppercase text-white/90"
              style={{ fontFamily: "Inter, SF Pro Display, Helvetica Neue, sans-serif" }}>
              Cool
            </h1>
            <h1 className="text-[5rem] font-black leading-none tracking-[-0.08em] uppercase text-white/20 ml-4"
              style={{ fontFamily: "Inter, SF Pro Display, Helvetica Neue, sans-serif" }}>
              Guy
            </h1>
          </div>
        </div>

        <div className="pl-[4vw] flex flex-col">
          {words.map((word, i) => (
            <WordSection key={i} word={word} containerRef={containerRef} />
          ))}
        </div>

        <div className="fixed inset-0 -z-10 pointer-events-none">
          <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-white/5 blur-[140px]" />
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-white/5 blur-[140px]" />
        </div>
      </section>

      <section className="min-h-screen snap-start bg-red-600 flex items-center justify-center">
        <h2 className="text-6xl font-bold text-white">End</h2>
      </section>
    </div>
  );
}