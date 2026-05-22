


import { motion } from "framer-motion";
import avatar1 from "@/assets/avatar-1.png";
import avatar2 from "@/assets/avatar-2.png";
import avatar3 from "@/assets/avatar-3.png";
import { Highlighter } from "@/components/ui/highlighter"
import Link from "next/link";
import RollingDigits from "./RollingDigits";
import HeroButton from "./HeroButton";

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] as const },
});



export default function Hero() {
  return (
    <section id="home" className="relative min-h-screen md:mb-20 flex flex-col items-center w-full overflow-hidden">
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute left-1/2 top-8 h-[70%] w-full -translate-x-1/2 object-cover md:top-20 md:h-[85%]"
        src="./hero-bg2.mp4"
      />
      <div className="absolute inset-0 pointer-events-none z-[1] 
  bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.6)_80%)]"
/>
      <div className="absolute inset-0 bg-background/40" />
      <div className="absolute top-0 left-0 right-0 h-[40%] bg-gradient-to-b from-background via-background/90 to-transparent z-[2]" />
<div className="absolute bottom-0 left-0 right-0 h-[40%] bg-gradient-to-t from-background via-background/80 to-transparent z-[2]" />
      <div className="relative z-10 flex mt-15 flex-col items-center text-center px-6 pt-28 md:pt-32 pb-32">
<motion.div
  initial={{ opacity: 0, filter: "blur(2px)" }}
  animate={{ opacity: 1, filter: "blur(0px)" }}
  transition={{ duration: 0.8, delay: 0.3 }}
  className="flex items-center gap-3 mb-8"
>                 <p>
                Every{" "}
                <Highlighter action="underline" animationDuration={1500} color="#FF9800">
                  rupee
                </Highlighter>{" "}
               you ignore is a{" "}
                <Highlighter action="highlight" animationDuration={1000} color="#87CEFA">
                   decision
                </Highlighter>{" "}
               you didnt make.
                </p>
          
               

        </motion.div>

        <div className=" flex flex-col items-center justify-center">

        <motion.h1
          {...fadeUp(0.1)}
          className="text-4xl md:text-7xl lg:text-8xl font-medium tracking-[-1px] md:tracking-[-2px] max-w-5xl text-foreground"
        >
          Track every <span className="font-serif italic font-normal">rupee.</span>
        </motion.h1>

        <motion.p
          {...fadeUp(0.2)}
          className="mt-8 text-lg max-w-2xl"
          style={{ color: "var(--hero-subtitle)" }}
        >
          Cash, Bank, eSewa, Khalti, one quiet workspace for income, expenses, loans and budgets. Built for the way Nepal actually spends.
        </motion.p>
 
         <motion.div {...fadeUp(0.5)} className="mt-5">
                    <RollingDigits  />

         </motion.div>

     <motion.div {...fadeUp(0.6)}  transition={{ duration: 0.8, delay: 0.3 }} className="">
  <Link href="/signIn" >
 
<HeroButton />

  </Link>
</motion.div>
        </div>
      </div>
    </section>
  );
}
