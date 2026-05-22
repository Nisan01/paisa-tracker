"use client";

import { motion } from "framer-motion";

const items = [
  "Expenses",
  "Savings",
  "Budgets",
  "Habits",
  "Spending",
  "Goals",
  "Payments",
  "Growth",
];

export default function ScrollPage() {
  return (
    <main className="">
      <section className="flex relative md:pl-20 items-start">
        <h1 className="sticky top-[calc(50vh-1.5lh)] text-[clamp(2rem,8vw,6rem)] font-black uppercase tracking-[-0.07em]">
          Track
        </h1>

        <div className="pl-10">
          {items.map((item, index) => (
            <motion.h1
              key={index}
              initial={{
                opacity: 0,
                y: 80,
                scale: 0.8,
                filter: "blur(12px)",
              }}
              whileInView={{
                opacity: 1,
                y: 0,
                scale: 1,
                filter: "blur(0px)",
              }}
              viewport={{ once: false, amount: 0.4 }}
              transition={{
                duration: 0.8,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="snap-center text-[clamp(2rem,8vw,6rem)] font-black uppercase leading-[1.5] tracking-[-0.07em]"
            >
              {item}
            </motion.h1>
          ))}
        </div>
      </section>
    </main>
  );
}