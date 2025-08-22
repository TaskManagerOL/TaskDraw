// 绘制元素
  import { createToolLibrary } from "../model/tool";

  const ToolLibrary = createToolLibrary()

  const toolData = {
    lineCap: 'round',
    lineJoin: 'round',
    strokeStyle: '#e0e0e0',
    lineWidth: 1
  }

  const drawElement = (ctx, element, viewport, scale, color, lineWidth, setElements) => {
    ctx.save();
    ctx.translate(-viewport.x * scale, -viewport.y * scale);
    ctx.scale(scale, scale);

    ctx.strokeStyle = element.color || color;
    ctx.fillStyle = element.color || color;
    ctx.lineWidth = element.lineWidth || lineWidth;
    ctx.lineCap = toolData.lineCap;
    ctx.lineJoin = toolData.lineJoin;

    ToolLibrary.updateTool(tool=>tool.name===element.type,null).fn.drawElement(ctx,element,setElements)
    ctx.restore();
  };

  const drawBackground = (ctx, width, height ,viewport,scale) => {
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

  const redrawCanvas = (canvasRef,elements,tempElement,viewport,scale,color,lineWidth,setElements) => {  //需要用脏矩阵优化
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);
    drawBackground(ctx, width, height,viewport,scale);
    elements.forEach(element => {
      drawElement(ctx, element,viewport, scale, color, lineWidth,setElements);
    });
    
    if (tempElement) {
      drawElement(ctx, tempElement,viewport, scale, color, lineWidth);
    }
  };

  export { drawElement,drawBackground,redrawCanvas }