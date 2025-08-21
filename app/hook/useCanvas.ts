'use client'
import { useRef, useEffect, useState } from 'react';

import { useMouseHandlers } from './useMouseHandlers';
import { redrawCanvas } from "../utils/draw";
// import useWebSocket from "./useWebSocket";

export default function useCanvas() {
  const canvasRef = useRef(null);
  const [viewport, setViewport] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [tool, setTool] = useState('ballpointPen');
  // 根据系统主题自动设置初始颜色为反色
  const getInitialColor = () => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? '#ffffff' : '#000000';
    }
    return '#000000';
  };
  const [color, setColor] = useState(getInitialColor);
  const [lineWidth, setLineWidth] = useState(10);
  const [isDrawing, setIsDrawing] = useState(false);
  const [elements, setElements] = useState([]);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedViewport = localStorage.getItem('canvas_viewport');
      if (savedViewport) {
        try {
          setViewport(JSON.parse(savedViewport));
        } catch {}
      }
      const savedElements = localStorage.getItem('canvas_elements');
      if (savedElements) {
        try {
          setElements(JSON.parse(savedElements));
        } catch {}
      }
    }
  }, []);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('canvas_viewport', JSON.stringify(viewport));
      localStorage.setItem('canvas_elements', JSON.stringify(elements));
    }
  }, [viewport, elements]);
  
  const [tempElement, setTempElement] = useState(null);
  const [firstTool,setFirstTool] = useState('draw')

  const mouseHandlers = useMouseHandlers(
    { tool, color, lineWidth, isDrawing, canvasRef, scale, viewport, isPanning, panStart, tempElement, elements },
    { setElements, setIsDrawing, setTempElement, setIsPanning, setPanStart, setViewport, setScale }
  );

  // // WebSocket 连接
  // const { ws, sendMessage } = useWebSocket({//需要优化结构
  //     url: "ws://localhost:8080", // 根据你的后端端口调整
  //     onOpen: () => {
  //         console.log("WebSocket 连接已建立");
  //     },
  //     onMessage: (event) => {
  //         setElements(JSON.parse(event.data).elements)
  //     },
  //     onClose: () => {
  //         console.log("WebSocket 连接已关闭");
  //     },
  //     onError: (err) => {
  //         console.error("WebSocket 错误:", err);
  //     },
  // });

  // 初始化Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      redrawCanvas(canvasRef, elements, tempElement, viewport, scale, color, lineWidth, setElements);
    }

    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      // 以当前中心点为基准调整 viewport
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
      redrawCanvas(canvasRef, elements, tempElement, viewport, scale, color, lineWidth, setElements);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [elements, tempElement, viewport, scale, color, lineWidth]);

  // 绘制工具变化时重绘
  useEffect(() => {
    redrawCanvas(canvasRef, elements, tempElement, viewport, scale, color, lineWidth);
    // sendMessage({elements})
  }, [viewport, scale, elements, tempElement, color, lineWidth]);

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