"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Hls from "hls.js";
import { FcGoogle } from "react-icons/fc";
import Link from "next/link";

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-100px" },
  transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] as const },
});

const HLS_URL = "https://stream.mux.com/8wrHPCX2dC3msyYU9ObwqNdm00u3ViXvOSHUMRYSEe5Q.m3u8";

function Logo() {
  return (
    <div className="relative w-10 h-10 flex items-center justify-center">
      <div className="absolute inset-0 rounded-full border-2 border-foreground/70" />
      <div className="w-5 h-5 rounded-full border border-foreground/70" />
    </div>
  );
}

export default function CTA() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(HLS_URL);
      hls.attachMedia(video);
      return () => hls.destroy();
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = HLS_URL;
    }
  }, []);

  return (
    <section className="relative py-24 md:py-44 border-t border-border/30 overflow-hidden">
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
      />
      <div className="absolute inset-0 bg-background/55 z-[1]" />

      <div className="relative z-10 flex flex-col items-center text-center px-6">
        <motion.div {...fadeUp(0)}>
          <Logo />
        </motion.div>
        <motion.h2
          {...fadeUp(0.1)}
          className="text-4xl md:text-7xl font-medium tracking-[-1.5px] md:tracking-[-2px] mt-6 max-w-3xl"
        >
          Take back your <span className="font-serif italic font-normal">paisa.</span>
        </motion.h2>
        <motion.p {...fadeUp(0.2)} className="text-muted-foreground text-base md:text-lg max-w-xl mt-6">
          Sign in with Google. Add your accounts. Track income, expenses, loans and budgets with smart alerts and recurring reminders.
        </motion.p>

        <motion.div {...fadeUp(0.3)} className="flex flex-col sm:flex-row items-center gap-3 mt-10">
     
          <Link href="/signIn" >
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="liquid-glass rounded-lg px-8 py-4 cursor-pointer text-sm font-semibold text-foreground"
          >
            <div className="flex items-center gap-2">  
            Continue with Google
           <FcGoogle className="w-5 h-5" />
           </div>
       

          
          </motion.button>
            </Link>
        </motion.div>
      </div>
    </section>
  );
}
