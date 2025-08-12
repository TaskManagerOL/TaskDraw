'use client'
import { useRef, useEffect, useState } from 'react';

import { useMouseHandlers } from './useMouseHandlers';
import { redrawCanvas } from "../utils/draw";

export default function useCanvas() {
  const canvasRef = useRef(null);
  const [viewport, setViewport] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [tool, setTool] = useState('ballpointPen');
  const [color, setColor] = useState('#000000');
  const [lineWidth, setLineWidth] = useState(10);
  const [isDrawing, setIsDrawing] = useState(false);
  const [elements, setElements] = useState([]);
  const [tempElement, setTempElement] = useState(null);
  const [firstTool,setFirstTool] = useState('draw')

  const mouseHandlers = useMouseHandlers(
    { tool, color, lineWidth, isDrawing, canvasRef, scale, viewport, isPanning, panStart, tempElement, elements },
    { setElements, setIsDrawing, setTempElement, setIsPanning, setPanStart, setViewport, setScale }
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

  return { 
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
  }
}