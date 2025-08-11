'use client'
import ToolBar from "../toolBar/toolBar";
import InfoBar from "../infoBar/infoBar";

import useCanvas from "../../hook/useCanvas";

export default function Canvas() {
  const {
    canvasRef,
    mouseHandlers,
    tool,
    setTool,
    color,
    setColor,
    lineWidth,
    setLineWidth,
    viewport,
    scale,
    firstTool,
    setFirstTool
  } = useCanvas();
  return(
    <div className="relative w-screen h-screen overflow-hidden">
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        onMouseDown={mouseHandlers.handleMouseDown}
        onMouseMove={mouseHandlers.handleMouseMove}
        onMouseUp={mouseHandlers.handleMouseUp}
        onMouseLeave={mouseHandlers.handleMouseUp}
        onWheel={mouseHandlers.handleWheel}
        onContextMenu={(e) => e.preventDefault()}
      />
      <ToolBar 
        tool={tool} 
        setTool={setTool} 
        color={color} 
        setColor={setColor}
        lineWidth={lineWidth} 
        setLineWidth={setLineWidth}
        firstTool={firstTool}
        setFirstTool={setFirstTool}
      />
      <InfoBar
        tool={tool}
        viewport={viewport}
        scale={scale}
      />
    </div>
  )
}