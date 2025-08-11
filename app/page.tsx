'use client'
import Canvas from "./components/canvas/canvas";

export default function Home() {
  return (
    <div className="relative w-screen h-screen overflow-hidden select-none">
      <Canvas></Canvas>
    </div>
  );
}