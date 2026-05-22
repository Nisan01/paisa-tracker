"use client";

import { useEffect, useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { Wallet, TrendingUp, Bell, FileText, Repeat, BarChart3 } from "lucide-react";

const p1 = "We're building a complete expenditure tracker where every transaction finds its place  where spending becomes visible, loans stay accountable, and budgets feel like clarity, not control.".split(" ");
const p2 = "A single home for cash, bank, eSewa, Khalti and custom wallets  with smart alerts, recurring reminders, and PDF exports for complete financial control.".split(" ");

const highlights = new Set(["every", "transaction", "visible"]);

function Word({ word, range, progress }: { word: string; range: [number, number]; progress: MotionValue<number> }) {
  const opacity = useTransform(progress, range, [0.15, 1]);
  const isHighlight = highlights.has(word.replace(/[^a-z]/gi, "").toLowerCase());
  return (
    <motion.span
      style={{ opacity, color: isHighlight ? "var(--foreground)" : "var(--hero-subtitle)" }}
      className="inline-block mr-[0.25em]"
    >
      {word}
    </motion.span>
  );
}

const featureCards = [
  {
    icon: Wallet,
    title: "Accounts and Balances",
    description: "Cash, Bank, eSewa, Khalti, unified balances across every source",
    gradient: "from-blue-500/20 to-purple-500/20"
  },
  {
    icon: TrendingUp,
    title: "Income & Expenses",
    description: "Track every rupee with clear trends, category breakdowns",
    gradient: "from-green-500/20 to-teal-500/20"
  },
  {
    icon: Bell,
    title: "Budgets & Alerts",
    description: "Set category limits and get notified before overspending",
    gradient: "from-orange-500/20 to-red-500/20"
  },
  {
    icon: BarChart3,
    title: "Loan Tracking",
    description: "Manage lent, borrowed loans with due dates and repayments",
    gradient: "from-cyan-500/20 to-blue-500/20"
  },
  {
    icon: Repeat,
    title: "Trips & Shared Spend",
    description: "Organize trip budgets and keep shared expenses tidy",
    gradient: "from-pink-500/20 to-rose-500/20"
  },
  {
    icon: FileText,
    title: "Reports & PDFs",
    description: "Export statements and summaries for records or sharing",
    gradient: "from-indigo-500/20 to-blue-500/20"
  }
];

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      delay: i * 0.1,
      ease: [0.22, 1, 0.36, 1]
    }
  })
};

export default function Mission() {
  const ref = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    containerRef.current = document.querySelector("main");
  }, []);

  const { scrollYProgress } = useScroll({
    target: ref,
    container: containerRef,
    offset: ["start 0.75", "start 0.15"],
  });

  const allWords = [...p1, ...p2];
  const total = allWords.length;

  return (
    <section id="features" ref={ref} className="px-6 md:px-12 md:pt-10 pb-32 md:pb-20">
      <div className="max-w-6xl mx-auto mb-20">
        <p className="text-2xl md:text-4xl lg:text-5xl font-medium tracking-[-1.5px] md:tracking-[-3px] leading-[1.25] md:leading-[1.2]">
          {p1.map((w, i) => {
            const start = i / total;
            const end = (i + 4) / total;
            return <Word key={`p1-${i}`} word={w} range={[start, Math.min(end, 1)]} progress={scrollYProgress} />;
          })}
        </p>
        <p className="text-lg md:text-2xl lg:text-3xl font-medium mt-8 md:mt-10 leading-[1.4] md:leading-[1.35]">
          {p2.map((w, i) => {
            const idx = p1.length + i;
            const start = idx / total;
            const end = (idx + 4) / total;
            return <Word key={`p2-${i}`} word={w} range={[start, Math.min(end, 1)]} progress={scrollYProgress} />;
          })}
        </p>
      </div>

      <div className="max-w-6xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {featureCards.map((card, i) => (
            <motion.div
              key={card.title}
              custom={i}
              variants={cardVariants}
              className="group relative"
            >
              <div className={`liquid-glass rounded-2xl p-8 h-full border border-border/30 hover:border-border/60 transition-all duration-300`}>
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${card.gradient} opacity-90 transition-opacity duration-500 group-hover:opacity-100`} />

                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-foreground/10 to-foreground/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <card.icon className="w-7 h-7 text-foreground/80" strokeWidth={1.5} />
                  </div>

                  <h3 className="text-xl font-semibold tracking-tight mb-3 group-hover:text-foreground transition-colors">
                    {card.title}
                  </h3>

                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {card.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
