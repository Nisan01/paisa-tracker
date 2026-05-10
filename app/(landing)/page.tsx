"use client";

import Image from "next/image";
import LandingPage from "../_components/LandingPage/LandingPage";
import Navbar from "../_components/_components/Navbar";
import ScrollChanged from "@/components/mindloop/ScrollTextChange";
import Hero from "@/app/_components/_components/Hero";
import Mission from "@/components/mindloop/Mission";
import Solution from "@/components/mindloop/Solution";
import Pricing from "@/components/mindloop/Pricing";
import CTA from "@/components/mindloop/CTA";
import Footer from "@/components/mindloop/Footer";
import ScrollPage from "../test2/page";


export default function Home() {
  return (
<>
<main className="bg-background relative text-foreground h-screen overflow-y-scroll snap-y snap-proximity">

      <Hero />
  
      <Mission />

      <Solution />
      <Pricing />
      <CTA />
      <Footer />
    </main>
</>
  );
}
