import FeatureMarquee from "@/app/(landing)/_components/FeatureMarquee";
import ScrollPage from "@/app/test2/page";
import { motion } from "framer-motion";

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-100px" },
  transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] as const },
});

const features = [
  { title: "Accounts and balances", desc: "Track Cash, Bank, eSewa, Khalti and custom wallets, all your money in one place." },
  { title: "Income and expenses", desc: "Log income and expenses with default categories or create your own custom tags." },
  { title: "Loan tracking", desc: "Lend or borrow money with partial repayments, due dates, and contact tracking." },
  { title: "Budgets and alerts", desc: "Set category limits, get budget alerts, and track spending with visual charts." },
];

export default function Solution() {
  return (
    <section id="solution" className="md:px-6  p-10  md:py-10 ">
      <div className="max-w-8xl md:px-7 mx-auto">
        <motion.p {...fadeUp(0)} className="text-xs md:pl-20 tracking-[3px] uppercase text-muted-foreground">
          The Platform
        </motion.p>
        <motion.h2 {...fadeUp(0.1)} className="text-4xl md:pl-20 md:text-6xl font-medium tracking-[-1.5px] mt-4 max-w-3xl">
          One <span className="font-serif italic font-normal">honest</span> view of your money
        </motion.h2>

        <motion.div {...fadeUp(0.2)} className="mt-20  rounded-2xl">
          <ScrollPage/>
        </motion.div>

<FeatureMarquee />
      </div>
    </section>
  );
}
