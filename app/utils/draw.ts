// 绘制元素
import { createToolLibrary } from "../model/tool";
import type { drawElementProps, drawBackgroundProps, redrawCanvasProps } from "../model/type";
import { toolData } from "../data/data";
import type { Element,ToolInput,Point } from "../model/type";
const ToolLibrary = createToolLibrary()

const drawElement:drawElementProps = (
  ctx, 
  element, 
  viewport, 
  scale, 
  color, 
  lineWidth
):void => {
  ctx.save();
  ctx.translate(-viewport.x * scale, -viewport.y * scale);
  ctx.scale(scale, scale);

  ctx.strokeStyle = element.color || color;
  ctx.fillStyle = element.color || color;
  ctx.lineWidth = element.lineWidth || lineWidth;
  ctx.lineCap = toolData.lineCap as CanvasLineCap;;
  ctx.lineJoin = toolData.lineJoin as CanvasLineJoin;;

  ToolLibrary.updateTool((tool: ToolInput) =>tool.name===element.type,null)?.fn?.drawElement(ctx,element)
  ctx.restore();
};

const drawBackground:drawBackgroundProps = (
  ctx, 
  width, 
  height,
  viewport,
  scale
):void => {
  const gridSize = 50;
  const worldLeft = viewport.x;
  const worldRight = viewport.x + width / scale;
  const worldTop = viewport.y;
  const worldBottom = viewport.y + height / scale;

  const startX = Math.floor(worldLeft / gridSize) * gridSize;
  const startY = Math.floor(worldTop / gridSize) * gridSize;

  ctx.strokeStyle = toolData.strokeStyle;
  ctx.lineWidth = toolData.lineWidth;

  for (let worldY = startY; worldY <= worldBottom; worldY += gridSize) {
      const screenY = (worldY - viewport.y) * scale;
      ctx.beginPath();
      ctx.moveTo(0, screenY);
      ctx.lineTo(width, screenY);
      ctx.stroke();
  }

  for (let worldX = startX; worldX <= worldRight; worldX += gridSize) {
      const screenX = (worldX - viewport.x) * scale;
      ctx.beginPath();
      ctx.moveTo(screenX, 0);
      ctx.lineTo(screenX, height);
      ctx.stroke();
  }
};

const createBackgroundBitmap = (//背景位图 用于合并
  width: number,
  height: number,
  viewport: Point,
  scale: number
): HTMLCanvasElement => {
  const off = document.createElement('canvas');
  off.width  = width;
  off.height = height;
  const ctx = off.getContext('2d')!;
  drawBackground(ctx, width, height, viewport, scale);
  return off;
};

const createElementsBitmap = ( //元素位图 用于合并
  width: number,
  height: number,
  viewport: Point,
  scale: number,
  color: string,
  lineWidth: number,
  elements: Element[],
): HTMLCanvasElement => {
  const off = document.createElement('canvas');
  off.width  = width;
  off.height = height;
  const ctx = off.getContext('2d')!;
  elements.forEach(element => {
    drawElement(ctx, element,viewport, scale, color, lineWidth)
  });
  return off;
};

const redrawCanvas:redrawCanvasProps = (
  canvasRef,
  elements,
  tempElement,
  viewport,
  scale,
  color,
  lineWidth,
  bgBitmap,
  elementsBitmap
):void => {  //需要用脏矩阵优化
  const canvas = canvasRef.current;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  if (!ctx) return;
  ctx.clearRect(0, 0, width, height);
  ctx.drawImage(bgBitmap||createBackgroundBitmap(width, height, viewport, scale), 0, 0);
  // ctx.drawImage(elementsBitmap, 0, 0);
  ctx.drawImage(elementsBitmap||createElementsBitmap(window.innerWidth, window.innerHeight, viewport, scale, color, lineWidth, elements), 0, 0);
  const tempElements: Element[] = Array.isArray(tempElement)?tempElement:[tempElement];
  if (tempElements && tempElements.length > 0) {
    const tempElement = tempElements[0];
    drawElement(ctx, tempElement,viewport, scale, color, lineWidth)
  }
};

const handleResize = (
  canvasRef: React.RefObject<HTMLCanvasElement>,
  setViewport: React.Dispatch<React.SetStateAction<Point>>,
  viewport: Point,
  scale: number,
  elements: Element[],
  tempElement: Element,
  color: string,
  lineWidth: number,
  bgBitmapRef: React.RefObject<HTMLCanvasElement>,
  elementsBitmapRef: React.RefObject<HTMLCanvasElement>
) => {
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
  bgBitmapRef.current = createBackgroundBitmap(window.innerWidth, window.innerHeight, viewport, scale);
  elementsBitmapRef.current = createElementsBitmap(window.innerWidth, window.innerHeight, viewport, scale, color, lineWidth, elements);
  redrawCanvas(canvasRef, elements, tempElement, viewport, scale, color, lineWidth, bgBitmapRef.current);
};

export { drawElement,drawBackground,redrawCanvas,createBackgroundBitmap,handleResize,createElementsBitmap }