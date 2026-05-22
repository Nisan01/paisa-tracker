"use client";

import { useEffect, useRef } from "react";
import "@/app/(landing)/_components/styles/odometer.css";

export default function Counter() {
  const elRef = useRef<HTMLDivElement>(null);
  const odRef = useRef<any>(null);

  useEffect(() => {
    if (!elRef.current) return;

    import("odometer").then((mod) => {
      const Odometer = mod.default;

      if (!odRef.current) {
        odRef.current = new Odometer({
          el: elRef.current,
          value: 100000,
          format: "(,ddd)",
          duration: 300,
        });
      }

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

        odRef.current.update(value);

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