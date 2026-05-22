"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";

import { Button } from "@/components/ui/button";
import Link from "next/link";

gsap.registerPlugin(ScrollToPlugin);

function Logo() {
  return (
    <div className="relative flex items-center justify-center">
      <Image
        src="/logo.png"
        alt="PaisaTracker Logo"
        width={33}
        height={33}
        className="object-cover"
      />
    </div>
  );
}

const links = ["Home", "Features", "Pricing"];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("home");

useEffect(() => {
  const scroller = document.querySelector("main");
  if (!scroller) return;

  const handleScroll = () => {
    setScrolled(scroller.scrollTop > 20); // ← scrollTop on the element
  };

  scroller.addEventListener("scroll", handleScroll);
  return () => scroller.removeEventListener("scroll", handleScroll);
}, []);

useEffect(() => {
  const scroller = document.querySelector("main");
  const sections = document.querySelectorAll("section[id]");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActive(entry.target.id);
      });
    },
    {
      root: scroller,          // ← observe relative to <main>
      rootMargin: "-45% 0px -45% 0px",
      threshold: 0,
    }
  );

  sections.forEach((section) => observer.observe(section));
  return () => observer.disconnect();
}, []);

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-[9999] transition-all duration-300 ${
        scrolled
          ? "bg-black/60 backdrop-blur-xl border-b border-white/10"
          : "bg-transparent"
      }`}
    >
      <div className="flex items-center justify-between px-8 md:px-28 py-4">
        {/* Logo */}
        <a
          href="#home"
          onClick={(e) => {
            e.preventDefault();

            const el = document.getElementById("home");

            if (el) {
              gsap.to(window, {
                duration: 1.2,
                scrollTo: {
                  y: el,
                  offsetY: 80,
                },
                ease: "power3.out",
              });
            }
          }}
          className="flex items-center gap-2"
        >
          <Logo />

          <span className="font-bold text-lg tracking-tight text-white">
            PaisaTracker
          </span>
        </a>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-3 text-sm">
          {links.map((link, i) => {
            const id = link.toLowerCase().replace(/\s+/g, "-");

            return (
              <div
                key={link}
                className="flex items-center gap-3 relative"
              >
                <a
                  href={`#${id}`}
                // In your click handler, target the scrollable container, not window
onClick={(e) => {
  e.preventDefault();
  const el = document.getElementById(id);
  const scroller = document.querySelector("main"); // your actual scroll container

  if (el && scroller) {
    gsap.to(scroller, {      // ← scroll the <main>, not window
      duration: 1.2,
      scrollTo: {
        y: el,
        offsetY: 60,
      },
      ease: "power3.out",
    });
  }
}}
                  className={`relative transition-all duration-300 ${
                    active === id
                      ? "text-white font-medium"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  {link}

                  <span
                    className={`absolute -bottom-1 left-0 h-[2px] w-full rounded-full bg-white origin-left transition-transform duration-500 ease-out ${
                      active === id
                        ? "scale-x-100"
                        : "scale-x-0"
                    }`}
                  />
                </a>

                {i < links.length - 1 && (
                  <span className="text-white/20">•</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Button */}
        <div className="flex items-center gap-2">
         <Link href="/signIn" className="text-white/60 hover:text-white transition-colors duration-300">
          <Button variant="outline" size="lg">
            Sign In
          </Button>
          </Link>
       
       
        </div>
      </div>
    </nav>
  );
}