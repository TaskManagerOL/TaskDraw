'use client'
import { useRef, useEffect, useState } from 'react';

import { useMouseHandlers } from './useMouseHandlers';
import { redrawCanvas,createBackgroundBitmap,createElementsBitmap,handleResize } from "../utils/draw";
import type { Element } from "../model/type"

export default function useCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null!);
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
  const [elements, setElements] = useState<Element[]>([]);
  const isRemoteUpdateRef = useRef<boolean|undefined>(false);
  const [tempElement, setTempElement] = useState<Element>({} as Element);
  const [firstTool,setFirstTool] = useState('draw')
  const bgBitmapRef = useRef<HTMLCanvasElement | null>(null);
  const elementsBitmapRef = useRef<HTMLCanvasElement | null>(null);
  const mouseHandlers = useMouseHandlers(
    { tool, color, lineWidth, isDrawing, canvasRef, scale, viewport, isPanning, panStart, tempElement, elements, isRemoteUpdateRef, bgBitmapRef, elementsBitmapRef },
    { setElements, setIsDrawing, setTempElement, setIsPanning, setPanStart, setViewport, setScale }
  );

  useEffect(() => { //本地存储
    if (typeof window !== 'undefined') {
      const savedViewport = sessionStorage.getItem('canvas_viewport');
      if (savedViewport) {
        try {
          setViewport(JSON.parse(savedViewport));
        } catch {}
      }
      const savedElements = sessionStorage.getItem('canvas_elements');
      if (savedElements) {
        try {
          setElements(JSON.parse(savedElements));
        } catch {}
      }
    }
  }, []);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('canvas_viewport', JSON.stringify(viewport));
      sessionStorage.setItem('canvas_elements', JSON.stringify(elements));
    }
  }, [elements]);//只在elements变化时存储，节省性能

  // 初始化Canvas
  useEffect(() => {
    console.log('初始化Canvas');
    const canvas = canvasRef.current;
    bgBitmapRef.current = createBackgroundBitmap(window.innerWidth, window.innerHeight, viewport, scale);
    elementsBitmapRef.current = createElementsBitmap(window.innerWidth, window.innerHeight, viewport, scale, color, lineWidth, elements);
    if (canvas) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      redrawCanvas(canvasRef, elements, tempElement, viewport, scale, color, lineWidth, bgBitmapRef.current, elementsBitmapRef.current);
    }
  }, []);

  useEffect(() => { //窗口变化
    window.addEventListener('resize', handleResize(canvasRef, setViewport, viewport, scale, elements, tempElement, color, lineWidth, bgBitmapRef, elementsBitmapRef));
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => { //背景位图更新
    bgBitmapRef.current = createBackgroundBitmap(window.innerWidth, window.innerHeight, viewport, scale);
  }, [scale,viewport]);

  useEffect(() => { //元素位图更新
    elementsBitmapRef.current = createElementsBitmap(window.innerWidth, window.innerHeight, viewport, scale, color, lineWidth, elements);
  },[elements,tempElement,scale, viewport]);
  
  useEffect(() => { // 重绘
    requestAnimationFrame(()=>redrawCanvas(canvasRef, elements, tempElement, viewport, scale, color, lineWidth, bgBitmapRef.current, elementsBitmapRef.current));
  }, [scale, viewport, elements, tempElement]);

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
    setFirstTool,
    elements,
    setElements,
    isRemoteUpdateRef
  }
}