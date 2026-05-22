"use client";

import * as React from "react";

const MIN_CHART_DIMENSION = 32;

interface ChartContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function ChartContainer({
  children,
  className,
}: ChartContainerProps) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  const [isReady, setIsReady] = React.useState(false);

  React.useLayoutEffect(() => {
    const el = containerRef.current;

    if (!el) return;

    const update = (rect = el.getBoundingClientRect()) => {
      const valid =
        rect.width >= MIN_CHART_DIMENSION &&
        rect.height >= MIN_CHART_DIMENSION;

      setIsReady(valid);
    };

    update();

    if (typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === el) {
          update(entry.contentRect);
        }
      }
    });

    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      data-chart-ready={isReady ? "true" : "false"}
      className={`
        relative
        w-full
        min-w-0
        overflow-hidden
        ${className ?? ""}
      `}
    >
      {isReady ? children : null}
    </div>
  );
}