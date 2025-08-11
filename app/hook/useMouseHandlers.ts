import { useCallback } from 'react';
import { screenToWorld } from "../utils/coordinate";
import { redrawCanvas } from "../utils/draw"
import { createToolLibrary } from "../model/tool";


export function useMouseHandlers(states,setters) {
  const {
    tool, color, lineWidth, isDrawing, canvasRef, scale,viewport,isPanning,panStart,tempElement,elements
  } = states;

  const {
    setElements, setIsDrawing, setTempElement,setIsPanning,setPanStart,setViewport,setScale
  } = setters;

  const ToolLibrary = createToolLibrary()

  const toolData = {
    zoomIntensity: 0.05,
    zoomMin: 0.3,
    zoomMax: 3
  }

  const handleMouseDown = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    if (e.button === 2) { // 中键或Ctrl键按下 - 平移模式
      setIsPanning(true);
      setPanStart({ x, y });
      return;
    }

    const worldPos = screenToWorld(x, y , viewport.x , viewport.y ,scale);

    setIsDrawing(true);

    ToolLibrary.updateTool(item=>item.name===tool,null).fn?.drawMouseDown(tool,color,lineWidth,worldPos,setTempElement,setElements)

  },[canvasRef,viewport,scale,tool,lineWidth,color,setIsPanning,setPanStart,setIsDrawing,setElements,setTempElement])

  const handleMouseMove = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (isPanning) {
        const dx = (x - panStart.x) / scale;
        const dy = (y - panStart.y) / scale;

        setViewport(prev => ({
            x: prev.x - dx,
            y: prev.y - dy
        }));

        setPanStart({ x, y });
        redrawCanvas(canvasRef,elements,tempElement,viewport,scale,color,lineWidth);
        return;
    }

    if (!isDrawing) return;

    const worldPos = screenToWorld(x, y , viewport.x , viewport.y ,scale);
    ToolLibrary.updateTool(item=>item.name===tool,null).fn?.drawMouseMove(worldPos,setTempElement,elements,setElements,lineWidth)
    redrawCanvas(canvasRef,elements,tempElement,viewport,scale,color,lineWidth);
  },[canvasRef,panStart,elements,color,lineWidth,tempElement,viewport,scale,tool,isDrawing,isPanning,setViewport,setPanStart,setTempElement,setElements])

  const handleMouseUp = useCallback(() => {
    if (isPanning) {
      setIsPanning(false);
      return;
    }
    if (!isDrawing) return;
    setIsDrawing(false);
    if(tempElement){
      setElements(prev => [...prev, tempElement]);
      setTempElement(null);
    }
  },[isPanning,tempElement,isDrawing,setIsPanning,setIsDrawing,setElements,setTempElement]);

  const handleWheel = useCallback((e) => {
    e.preventDefault();

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
    redrawCanvas(canvasRef,elements,tempElement,viewport,scale,color,lineWidth);
  },[canvasRef,elements,tempElement,viewport,scale,color,lineWidth,setViewport,setScale]);
  return {
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleWheel
  }
}