"use client";

import { useEffect, useRef } from "react";
import "@/app/(landing)/_components/styles/odometer.css";
import type Odometer from "odometer";

export default function Counter() {
  const elRef = useRef<HTMLDivElement>(null);
  const odRef = useRef<Odometer | null>(null);

  useEffect(() => {
    const el = elRef.current;
    if (!el) return;

    import("odometer").then((mod) => {
      const Odometer = mod.default;

      if (!odRef.current) {
        odRef.current = new Odometer({
          el,
          value: 100000,
          format: "(,ddd)",
          duration: 300,
        });
      }

      const odometer = odRef.current;
      let value = 100000;

      const animate = () => {
        if (value <= 1) return;

        // dynamic speed: slower near end
        const delay =
          value > 1000 ? 30 :
          value > 100 ? 60 :
          value > 20 ? 120 :
          250;

        value -= Math.ceil(value / 20); // smooth easing

        odometer.update(value);

        setTimeout(animate, delay);
      };

      setTimeout(animate, 500);
    });
  }, []);

  return (
<div className="text-4xl font-bold flex items-center gap-2">
  <span className="text-muted-foreground">Rs</span>
  <div ref={elRef} className="odometer text-5xl font-bold tabular-nums">100,000</div>
</div>
  );
}
