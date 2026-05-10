"use client";

import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";

const words = [
  "disappears",
  "vanishes",
  "fades away",
  "gets lost",
  "slips through",
  "goes missing",
  "evaporates",
  "drains away",
];

interface WordChangeProps {
  progress: MotionValue<number>;
  index: number;
  word: string;
  totalWords: number;
}

function WordChange({
  progress,
  index,
  word,
  totalWords,
}: WordChangeProps) {
  const isLast = index === totalWords - 1;

  // Y movement
  const y = useTransform(
    progress,
    isLast
      ? [index / totalWords, (index + 0.5) / totalWords]
      : [
          index / totalWords,
          (index + 0.5) / totalWords,
          (index + 1) / totalWords,
        ],
    isLast ? [150, 0] : [150, 0, -150]
  );

  // Opacity
  const opacity = useTransform(
    progress,
    isLast
      ? [index / totalWords, (index + 0.3) / totalWords]
      : [
          index / totalWords,
          (index + 0.2) / totalWords,
          (index + 0.8) / totalWords,
          (index + 1) / totalWords,
        ],
    isLast ? [0, 1] : [0, 1, 1, 0]
  );

  // Scale (slight premium effect on last word)
  const scale = useTransform(
    progress,
    isLast
      ? [index / totalWords, (index + 0.5) / totalWords]
      : [
          index / totalWords,
          (index + 0.5) / totalWords,
          (index + 1) / totalWords,
        ],
    isLast ? [0.9, 1.05] : [0.8, 1, 0.8]
  );

  return (
    <motion.span
      style={{ opacity, y, scale }}
      className="absolute inset-0 flex translate-y-[12px] items-center justify-center text-5xl md:text-7xl lg:text-8xl font-medium tracking-[-2px]"
    >
      {word}
    </motion.span>
  );
}

export default function ScrollTextChange() {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Clamp progress so last word stays
  const smoothProgress = useTransform(
    scrollYProgress,
    [0, 0.9],
    [0, 1]
  );

  return (
    <section
      ref={containerRef}
      className="relative min-h-[400vh] px-6 md:px-12 py-5"
    >
      <div className="sticky top-[30vh] max-w-6xl mx-auto w-full">
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
          
          {/* Left static text */}
          <motion.div
            initial={{ opacity: 0, x: -30, y: 10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl lg:text-8xl font-medium tracking-[-2px] text-foreground"
          >
            Money
          </motion.div>

          {/* Right animated words */}
          <div className="relative h-[200px] md:h-[250px] lg:h-[300px] w-full md:w-[500px] overflow-hidden">
            {words.map((word, index) => (
              <WordChange
                key={word}
                progress={smoothProgress} // ✅ important fix
                index={index}
                word={word}
                totalWords={words.length}
              />
            ))}
          </div>
        </div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-center text-muted-foreground text-lg max-w-2xl mx-auto mt-12"
        >
          Track every rupee across Cash, Bank, eSewa, Khalti — before it slips away
        </motion.p>
      </div>
    </section>
  );
}