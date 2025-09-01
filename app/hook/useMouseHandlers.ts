import { useCallback, useRef } from 'react';
import type {MouseEvent,TouchEvent,WheelEvent} from 'react';
import { screenToWorld } from "../utils/coordinate";
import { redrawCanvas } from "../utils/draw"
import { createToolLibrary } from "../model/tool";
import type { States, Setters, ToolInput, Element as ElementType } from "../model/type"
import { toolData } from '../data/data';

type PointerEvent = MouseEvent<Element> | TouchEvent<Element>;

function clientPos(e: PointerEvent) {//移动端和PC端获取坐标
  if ('clientX' in e) return { originX: e.clientX, originY: e.clientY };
  const t = e.touches[0] || e.changedTouches[0];
  return { originX: t.clientX, originY: t.clientY };
}

function getPinchInfo(ts: readonly Touch[]) {//获取双指缩放信息
  if (ts?.length < 2) return null;
  const [t1, t2] = [ts[0], ts[1]];
  const dx = t2.clientX - t1.clientX;
  const dy = t2.clientY - t1.clientY;
  const distance = Math.hypot(dx, dy);
  const center = { x: (t1.clientX + t2.clientX) / 2, y: (t1.clientY + t2.clientY) / 2 };
  const pointer = {x:t1.clientX,y:t1.clientY}
  return { distance, center, pointer };
}

export function useMouseHandlers(states: States, setters: Setters) {
  const pinchRef = useRef<{
    distance: number;
  } | null>(null);

  const {
    tool, color, lineWidth, isDrawing, canvasRef, scale, viewport, isPanning, panStart, tempElement, elements, isRemoteUpdateRef, bgBitmapRef, elementsBitmapRef
  } = states;

  const {
    setElements, setIsDrawing, setTempElement,setIsPanning,setPanStart,setViewport,setScale
  } = setters;

  const ToolLibrary = createToolLibrary()

  const handleMouseDown = useCallback((e: PointerEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const { originX, originY } = clientPos(e);
    const rect = canvas.getBoundingClientRect();
    const x = originX - rect.left
    const y = originY - rect.top

    if ('touches' in e && e.touches && e.touches.length === 2) {
      const touches = Array.from(e.touches as unknown as Touch[]);
      const pinchInfo = getPinchInfo(touches);
      if (pinchInfo) {
        setIsPanning(true);
        setPanStart({ x: pinchInfo.pointer.x - rect.left, y: pinchInfo.pointer.y - rect.top });
        pinchRef.current = { distance: pinchInfo.distance }; // 初始化 pinchRef
      }
      return;
    }

    if ('button' in e && e.button === 2) {
      setIsPanning(true);
      setPanStart({ x, y });
      return;
    }

    const worldPos = screenToWorld(x, y , viewport.x , viewport.y ,scale);

    setIsDrawing(true);

    ToolLibrary.updateTool((item: ToolInput) => item.name === tool,null)?.fn?.drawMouseDown?.(tool,color,lineWidth,worldPos,setTempElement)

  },[canvasRef,viewport,scale,tool,lineWidth,color,setIsPanning,setPanStart,setIsDrawing,setTempElement,ToolLibrary])

  const handleMouseMove = useCallback((e: PointerEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const { originX, originY } = clientPos(e);
    const rect = canvas.getBoundingClientRect();
    const x = originX - rect.left
    const y = originY - rect.top

    if ('touches' in e && e.touches && e.touches.length === 2) {
      const touches = Array.from(e.touches as unknown as Touch[]);
      const pinchInfo = getPinchInfo(touches);
      if (pinchInfo) {
        if (pinchRef.current) {
          const scaleChange = pinchInfo.distance / pinchRef.current.distance;
          const newScale = Math.max(toolData.zoomMin, Math.min(scale * scaleChange, toolData.zoomMax));
          setViewport(prev => ({
            x: prev.x + pinchInfo.center.x * (1 - scale / newScale),
            y: prev.y + pinchInfo.center.y * (1 - scale / newScale)
          }));
          setScale(newScale);
        }
        pinchRef.current = { distance: pinchInfo.distance }; // 只更新
      }
    }

    if (isPanning) {
        const dx = (x - panStart.x) / scale;
        const dy = (y - panStart.y) / scale;

        setViewport(prev => ({
            x: prev.x - dx,
            y: prev.y - dy
        }));

        setPanStart({ x, y });
        redrawCanvas(canvasRef,elements,tempElement,viewport,scale,color,lineWidth,bgBitmapRef.current,elementsBitmapRef.current);
        return;
    }

    if (!isDrawing) return;

    const worldPos = screenToWorld(x, y , viewport.x , viewport.y ,scale);
    ToolLibrary.updateTool((item: ToolInput) => item.name === tool,null)?.fn?.drawMouseMove?.(worldPos,setTempElement,elements,setElements,lineWidth)
    redrawCanvas(canvasRef,elements,tempElement,viewport,scale,color,lineWidth,bgBitmapRef.current,elementsBitmapRef.current);
  },[
    canvasRef,
    panStart,
    elements,
    color,
    lineWidth,
    tempElement,
    viewport,
    scale,
    tool,
    isDrawing,
    isPanning,
    setViewport,
    setPanStart,
    setTempElement,
    setElements,
    ToolLibrary,
    setScale,
        bgBitmapRef,
    elementsBitmapRef
  ]);

  const handleMouseUp = useCallback(() => {
    if (isPanning) {
      setIsPanning(false);
      return;
    }
    if (!isDrawing) return;
    setIsDrawing(false);
    if(tempElement){
    setElements(prev => {
      const prevElements = prev ?? [];
      if (!tempElement) {
        return prevElements;
      }
      const elementsToAdd = Array.isArray(tempElement) ? tempElement : [tempElement];
      return [...prevElements, ...elementsToAdd];
    });
      setTempElement({} as ElementType);
    }
    console.log(Date.now());
    
    isRemoteUpdateRef!.current = false;
  },[isPanning,tempElement,isDrawing,setIsPanning,setIsDrawing,setElements,setTempElement,isRemoteUpdateRef]);

  const handleWheel = useCallback((e: WheelEvent<Element>) => {

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const worldPos = screenToWorld(x, y , viewport.x , viewport.y ,scale);

    const wheel = e.deltaY < 0 ? 1 : -1;
    const newScale = Math.max(toolData.zoomMin, Math.min(scale + wheel * toolData.zoomIntensity, toolData.zoomMax));
    setViewport(prev => ({
      x: prev.x + worldPos.x * (1 - scale / newScale),
      y: prev.y + worldPos.y * (1 - scale / newScale)
    }));

    setScale(newScale);
    redrawCanvas(canvasRef,elements,tempElement,viewport,scale,color,lineWidth,bgBitmapRef.current,elementsBitmapRef.current);
  },[
    canvasRef,
    elements,
    tempElement,
    viewport,
    scale,
    color,
    lineWidth,
    setViewport,
    setScale,
    bgBitmapRef,
    elementsBitmapRef
  ]);
  return {
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleWheel
  }
}