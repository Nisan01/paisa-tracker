import { motion } from "framer-motion";
import { Wallet, Landmark, Smartphone } from "lucide-react";

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-100px" },
  transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] as const },
});

const platforms = [
  {
    Icon: Wallet,
    name: "Cash in hand",
    desc: "The notes in your wallet rarely make it into a spreadsheet. They quietly disappear by month-end.",
  },
  {
    Icon: Landmark,
    name: "Bank accounts",
    desc: "Statements arrive late, scattered across apps. You see balances, never the story behind them.",
  },
  {
    Icon: Smartphone,
    name: "eSewa & Khalti",
    desc: "Wallet payments are instant, frictionless, and forgotten. Convenience without a paper trail.",
  },
];

export default function SearchChanged() {
  return (
    <section id="how-it-works" className="relative px-6 md:px-12 pt-52 md:pt-64 pb-6 md:pb-9 text-center">
      <motion.h2
        {...fadeUp(0)}
        className="text-5xl md:text-7xl lg:text-8xl font-medium tracking-[-2px] max-w-5xl mx-auto"
      >
        Money moves <span className="font-serif italic font-normal">silently.</span> Catch it.
      </motion.h2>
      <motion.p
        {...fadeUp(0.1)}
        className="text-muted-foreground text-lg max-w-2xl mx-auto mt-8 mb-24"
      >
        Most of your spending happens across places that don&apos;t talk to each other. PaisaTracker brings them into one calm view.
      </motion.p>

      <div className="grid md:grid-cols-3 gap-12 md:gap-8 mb-20 max-w-5xl mx-auto">
        {platforms.map((p, i) => (
          <motion.div key={p.name} {...fadeUp(0.15 + i * 0.1)} className="flex flex-col items-center">
            <div className="liquid-glass w-[140px] h-[140px] rounded-3xl flex items-center justify-center">
              <p.Icon className="w-12 h-12 text-foreground/80 glow-icon" strokeWidth={1.25} />
            </div>
            <h3 className="font-semibold text-base mt-6">{p.name}</h3>
            <p className="text-muted-foreground text-sm mt-2 max-w-xs">{p.desc}</p>
          </motion.div>
        ))}
      </div>

      <motion.p {...fadeUp(0.2)} className="text-muted-foreground text-sm">
        If you don&apos;t track where it goes, it decides for you.
      </motion.p>
    </section>
  );
}
