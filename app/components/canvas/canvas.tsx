'use client'
import { useRef, useEffect, useState } from 'react';

import ToolBar from "../toolBar/toolBar";
import InfoBar from "../infoBar/infoBar";

import { useMouseHandlers } from '../../hook/useMouseHandlers';
import { redrawCanvas } from "../../utils/draw";

export default function Canvas() {
  const canvasRef = useRef(null);
  const [viewport, setViewport] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [tool, setTool] = useState('');
  const [color, setColor] = useState('#000000');
  const [lineWidth, setLineWidth] = useState(3);
  const [isDrawing, setIsDrawing] = useState(false);
  const [elements, setElements] = useState([]);
  const [tempElement, setTempElement] = useState(null);

  const mouseHandlers = useMouseHandlers(
    { tool, color, lineWidth, isDrawing, canvasRef, scale,viewport,isPanning,panStart,tempElement,elements },
    { setElements, setIsDrawing, setTempElement,setIsPanning,setPanStart,setViewport,setScale }
  );

    // 初始化Canvas
  useEffect(() => {
    const updateCanvasSize = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const currentCenterX = canvas.width / (2 * scale) + viewport.x;
        const currentCenterY = canvas.height / (2 * scale) + viewport.y;
        const newWidth = window.innerWidth;
        const newHeight = window.innerHeight;
        canvas.width = newWidth;
        canvas.height = newHeight;
        const newViewportX = currentCenterX - newWidth / (2 * scale);
        const newViewportY = currentCenterY - newHeight / (2 * scale);
        setViewport({
            x: newViewportX,
            y: newViewportY
        });
        redrawCanvas(canvasRef,elements,tempElement,viewport,scale,color,lineWidth,setElements);
    };
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => {
      window.removeEventListener('resize', updateCanvasSize);
    };
  }, []);

  // 绘制工具变化时重绘
  useEffect(() => {
    redrawCanvas(canvasRef,elements,tempElement,viewport,scale,color,lineWidth);
  }, [viewport, scale, elements, tempElement]);

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
      />
      <InfoBar
        tool={tool}
        viewport={viewport}
        scale={scale}
      />
    </div>
  )
}