"use client";

import Image from "next/image";
import Navbar from "./_components/Navbar";
import ScrollChanged from "@/app/(landing)/_components/ScrollTextChange";
import Hero from "@/app/(landing)/_components/Hero";
import Mission from "@/app/(landing)/_components/Mission";
import Solution from "@/app/(landing)/_components/Solution";
import Pricing from "@/app/(landing)/_components/Pricing";
import CTA from "@/app/(landing)/_components/CTA";
import Footer from "@/app/(landing)/_components/Footer";
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
