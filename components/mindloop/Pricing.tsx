"use client";

import { motion } from "framer-motion";
import { Check, X } from "lucide-react";

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-100px" ,amount: 0.3},
  transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] as const },
});

const plans = [
  {
    name: "Basic",
    price: "$9.99",
    period: "/month",
    features: ["Limited transactions", "Basic reports", "Email support"],
    highlighted: false,
  },
  {
    name: "Pro",
    price: "Free",
    period: "forever",
    features: ["Unlimited transactions", "Multi-account support", "Budget alerts & reminders", "Loan management", "PDF exports", "Dashboard charts"],
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "$29.99",
    period: "/month",
    features: ["Team collaboration", "API access", "Custom integrations", "Dedicated support"],
    highlighted: false,
  },
];

export default function Pricing() {

  
  return (
    <section id="pricing" className="px-6  md:px-12 py-10 md:py-8">
      <div className="max-w-6xl mx-auto">
        <motion.p {...fadeUp(0)} className="text-xs  tracking-[3px] uppercase text-muted-foreground">
          Pricing
        </motion.p>
        <motion.h2 {...fadeUp(0.1)} className="text-3xl md:text-7xl font-medium tracking-[-1.5px] mt-4 max-w-3xl">
          Simple, <span className="font-serif italic font-normal">honest</span> pricing
        </motion.h2>
        <motion.p {...fadeUp(0.2)} className="text-muted-foreground text-base max-w-xl mt-4">
          No hidden fees. No surprises. Just powerful financial tracking that works for you.
        </motion.p>

        <div className="grid md:grid-cols-3 gap-4 md:gap-6 mt-12">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              {...fadeUp(0.1 + i * 0.1)}
              className={`relative rounded-xl p-6  ${
                plan.highlighted
                  ? " border-2 border-primary/20"
                  : "bg-card/50 border border-border/30"
              }`}
            >
              {!plan.highlighted && (
                <div className="absolute top-3 right-3 w-5 h-5 flex items-center justify-center">
                  <X className="w-3.5 h-3.5 text-muted-foreground/50" />
                </div>
              )}

              {plan.highlighted && (
                <div className="absolute top-6 left-1/2 -translate-x-1/2">
                  <div className="border px-6 py-1 rounded-xl text-[12px] font-semibold text-foreground">
                    Completely Free
                  </div>
                </div>
              )}

              <h3 className={`text-base font-semibold ${plan.highlighted ? "text-foreground" : "text-muted-foreground"}`}>
                {plan.name}
              </h3>

              <div className="mt-3">
                <span className={`text-3xl md:text-4xl font-medium tracking-tight ${plan.highlighted ? "text-foreground" : "text-muted-foreground/70"}`}>
                  {plan.price}
                </span>
                <span className={`text-xs ml-1 ${plan.highlighted ? "text-muted-foreground" : "text-muted-foreground/50"}`}>
                  {plan.period}
                </span>
              </div>

              <ul className="mt-5 space-y-4">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5">
                    <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${plan.highlighted ? "text-primary" : "text-muted-foreground/30"}`} />
                    <span className={`text-sm ${plan.highlighted ? "text-foreground" : "text-muted-foreground/70"}`}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <button
                className={`w-full mt-12 py-2.5 cursor-pointer rounded-lg text-xs font-semibold transition-all ${
                  plan.highlighted
                    ? "bg-green-700 text-foreground hover:scale-[1.02] active:scale-[0.98]"
                    : "bg-muted/30 text-muted-foreground/50 cursor-not-allowed"
                }`}
              >
                {plan.highlighted ? "Get Started Free" : "Not Available"}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
