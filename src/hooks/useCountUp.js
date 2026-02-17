import { useState, useEffect, useRef } from "react";

/** Animates from 0 to target over duration (ease-out). Returns number; use decimals option for fractional display. */
export function useCountUp(target, durationMs = 700, decimals = 0) {
  const [value, setValue] = useState(0);
  const rafRef = useRef(null);
  const startRef = useRef(null);
  const fromRef = useRef(0);

  useEffect(() => {
    const targetNum = Number(target);
    if (!Number.isFinite(targetNum) || targetNum < 0) {
      setValue(target);
      return;
    }

    const scale = decimals > 0 ? Math.pow(10, decimals) : 1;
    const scaledTarget = Math.round(targetNum * scale);
    setValue(0);
    fromRef.current = 0;
    startRef.current = performance.now();

    function tick(now) {
      const elapsed = now - startRef.current;
      const t = Math.min(elapsed / durationMs, 1);
      const eased = 1 - (1 - t) ** 3;
      const current = Math.round(0 + (scaledTarget - 0) * eased);
      setValue(scale === 1 ? current : current / scale);
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target, decimals]);

  return decimals > 0 ? Number(value.toFixed(decimals)) : Math.round(value);
}
