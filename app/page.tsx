'use client'
import Canvas from "./components/canvas/canvas";
import { Suspense } from 'react';

export default function Home() {
  return (
    <Suspense fallback={null}>
      <div className="relative w-screen h-screen overflow-hidden select-none">
        <Canvas></Canvas>
      </div>
    </Suspense>
  );
}