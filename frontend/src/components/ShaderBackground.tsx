"use client";

import { MeshGradient, DotGrid } from "@paper-design/shaders-react";
import { useEffect, useState } from "react";

export function ShaderBackground() {
  const [dimensions, setDimensions] = useState({ width: 1920, height: 1080 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const update = () =>
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-0">
      {/* Layer 1: Flowing gradient — color + movement */}
      <MeshGradient
        className="absolute inset-0 w-full h-full"
        colors={[
          "#7c3aed",
          "#312e81",
          "#be185d",
          "#1e1b4b",
          "#5b21b6",
          "#0c0a1f",
        ]}
        speed={0.25}
        distortion={0.6}
        swirl={0.5}
        grainMixer={0}
        grainOverlay={0.03}
        width={dimensions.width}
        height={dimensions.height}
      />
      {/* Layer 2: GPU dot grid — structural depth */}
      <div className="absolute inset-0 opacity-15 mix-blend-screen">
        <DotGrid
          className="w-full h-full"
          colorBack="#000000"
          colorFill="#c4b5fd"
          colorStroke="#000000"
          size={1}
          gapX={32}
          gapY={32}
          strokeWidth={0}
          sizeRange={0.2}
          opacityRange={0.4}
          shape="circle"
          width={dimensions.width}
          height={dimensions.height}
        />
      </div>
      {/* Dark veil */}
      <div className="absolute inset-0 pointer-events-none bg-black/50" />
    </div>
  );
}
