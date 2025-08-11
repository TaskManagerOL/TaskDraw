//此处写工具的canvas逻辑
const ballpointPen = {
  drawElement:(...args) => {
    const [ ctx,element ] = args
    ctx.beginPath();
    element.points.forEach((point, i) => {
      if (i === 0)
        ctx.moveTo(point.x, point.y);
      else
        ctx.lineTo(point.x, point.y);
    });
    ctx.stroke();
  },
  drawMouseDown:(...args) => {
    const [ tool,color,lineWidth,worldPos,setTempElement ] = args
    setTempElement({
      type: tool,
      points: [worldPos],
      color,
      lineWidth
    });
  },
  drawMouseMove: (...args)=>{
    const [ worldPos,setTempElement ] = args
    setTempElement(prev => ({
      ...prev,
      points: [...prev.points, worldPos]
    }));
  }
}

const rectangle = {
  drawElement: (...args) => {
    const [ ctx,element ] = args
    ctx.beginPath();
    ctx.rect(
      Math.min(element.startX, element.endX),
      Math.min(element.startY, element.endY),
      Math.abs(element.endX - element.startX),
      Math.abs(element.endY - element.startY)
    );
    ctx.stroke();
  },
  drawMouseDown: (...args) => {
    const [ tool,color,lineWidth,worldPos,setTempElement ] = args
    setTempElement({
      type: tool,
      startX: worldPos.x,
      startY: worldPos.y,
      endX: worldPos.x,
      endY: worldPos.y,
      color,
      lineWidth
    });
  },
  drawMouseMove: (...args) => {
    const [ worldPos,setTempElement ] = args
    setTempElement(prev => ({
      ...prev,
      endX: worldPos.x,
      endY: worldPos.y
    }));
  }
}

const circle = {
  drawElement: (...args) => {
    const [ ctx,element ] = args
    const radius = Math.sqrt(
      Math.pow(element.endX - element.startX, 2) +
      Math.pow(element.endY - element.startY, 2)
    );
    ctx.beginPath();
    ctx.arc(element.startX, element.startY, radius, 0, Math.PI * 2);
    ctx.stroke();
  },
  drawMouseDown: rectangle.drawMouseDown,
  drawMouseMove: rectangle.drawMouseMove
}

function distToSegment(p: {x:number,y:number}, v:{x:number,y:number}, w:{x:number,y:number}): number {
  const l2 = (w.x - v.x) ** 2 + (w.y - v.y) ** 2;
  if (l2 === 0) return Math.hypot(p.x - v.x, p.y - v.y);
  let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
  t = Math.max(0, Math.min(1, t));
  const proj = { x: v.x + t * (w.x - v.x), y: v.y + t * (w.y - v.y) };
  return Math.hypot(p.x - proj.x, p.y - proj.y);
}

const elementEraser = {
  drawElement: null,
  drawMouseDown: (...args) => {
    return 0
  },
  drawMouseMove: (...args) => {
    const [worldPos, , elements, setElements, lineWidth] = args;
    const r = lineWidth / 2;
    const hitIndex = elements.findIndex(el => {
      if (el.type == 'ballpointPen'){
        for (let i = 0; i < el.points.length - 1; i++) {
          const p1 = el.points[i];
          const p2 = el.points[i + 1];
          const d = distToSegment(worldPos, p1, p2);
          if (d <= r) return true;
        }
      }else if(el.type == 'rectangle'||el.type == 'circle'){
        const d = distToSegment(worldPos, {x:el.startX,y:el.startY}, {x:el.endX,y:el.endY});
          if (d <= r) return true;
      }
      return false;
    });

    if (hitIndex !== -1) {
      setElements(prev => prev.filter((_, i) => i !== hitIndex));
    }
  }
}

const normalEraser = {
  drawElement: null,
  drawMouseDown: (...args) => {
    return 0
  },
  drawMouseMove: (...args) => {

  }
}

export { ballpointPen,rectangle,circle,elementEraser,normalEraser }