"use client";

import { useEffect, useState } from "react";

/**
 * Generates a canvas-based noise PNG at runtime (once on mount, ~1ms).
 * No network request, no re-render cycle.
 *
 * Usage:
 *   const noiseUrl = useNoiseTexture(128, 40);
 *   <div style={{ backgroundImage: `url(${noiseUrl})`, backgroundSize: '128px 128px' }} />
 */
export function useNoiseTexture(size = 128, intensity = 40): string | null {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const imageData = ctx.createImageData(size, size);
    const d = imageData.data;

    for (let i = 0; i < d.length; i += 4) {
      const v = Math.random() * intensity;
      d[i] = v;
      d[i + 1] = v;
      d[i + 2] = v;
      d[i + 3] = 255;
    }

    ctx.putImageData(imageData, 0, 0);
    setUrl(canvas.toDataURL("image/png"));
  }, [size, intensity]);

  return url;
}
