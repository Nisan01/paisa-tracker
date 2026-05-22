import { useEffect, useRef, useState } from "react";

export function useContainerWidth() {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (!ref.current) return;

    const el = ref.current;

    const observer = new ResizeObserver(() => {
      setWidth(el.getBoundingClientRect().width);
    });

    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  return { ref, width };
}