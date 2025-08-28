import { toolData } from '../data/data';
import { Element, ToolFn, Point } from '../model/type';

function distToSegment(p: Point, v:Point, w:Point): number { //判断橡皮擦与线段的距离
  const l2 = (w.x - v.x) ** 2 + (w.y - v.y) ** 2;
  if (l2 === 0) return Math.hypot(p.x - v.x, p.y - v.y);
  let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
  t = Math.max(0, Math.min(1, t));
  const proj = { x: v.x + t * (w.x - v.x), y: v.y + t * (w.y - v.y) };
  return Math.hypot(p.x - proj.x, p.y - proj.y);
}

function interpolatePoints(a: Point, b: Point) { //两点间插值，返回插值点数组
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const dist = Math.sqrt(dx*dx + dy*dy);
  const steps = Math.max(1, Math.ceil(dist / toolData.pointDistThreshold));
  const pts = [];
  for (let i = 0; i < steps; i++) {
    pts.push({
      x: a.x + (dx * i) / steps,
      y: a.y + (dy * i) / steps
    });
  }
  return pts;
}

//此处写工具的canvas逻辑
const ballpointPen:ToolFn = {
  drawElement:(...args) => {
    const [ ctx,element ] = args
    ctx.beginPath();
    element.points.forEach((point, i) => {
      if (!point) return;
      if (i === 0 || !element.points[i - 1]) {
        ctx.moveTo(point.x, point.y);
      } else {
        ctx.lineTo(point.x, point.y);
      }
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
    const [ worldPos,setTempElement ] = args;
    const DIST_THRESHOLD = toolData.pointDistThreshold
    setTempElement(prev => {
      if (!prev || !prev.points || prev.points.length === 0) return prev;
      const last = prev.points[prev.points.length - 1];
      const dx = worldPos.x - last.x;
      const dy = worldPos.y - last.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist <= DIST_THRESHOLD) {
        return {
          ...prev,
          points: [...prev.points, worldPos]
        };
      }

      const steps = Math.ceil(dist / DIST_THRESHOLD);
      const newPoints = [];
      for (let i = 1; i <= steps; i++) {
        newPoints.push({
          x: last.x + (dx * i) / steps,
          y: last.y + (dy * i) / steps
        });
      }
      return {
        ...prev,
        points: [...prev.points, ...newPoints]
      };
    });
  }
}

const rectangle:ToolFn = {
  drawElement: (...args: [CanvasRenderingContext2D, Element]) => {
    const [ ctx,element ] = args;
    const validPoints = element.points.filter(Boolean);
    if (validPoints.length < 2) return;
    ctx.beginPath();
    let prevValid = false;
    validPoints.forEach((point) => {
      if (!point) {
        prevValid = false;
        return;
      }
      if (!prevValid) {
        ctx.moveTo(point.x, point.y);
      } else {
        ctx.lineTo(point.x, point.y);
      }
      prevValid = true;
    });
    if (validPoints.length > 2) {
      const first = validPoints[0];
      const last = validPoints[validPoints.length - 1];
      if (Math.abs(first.x - last.x) < 1e-2 && Math.abs(first.y - last.y) < 1e-2) {
        ctx.closePath();
      }
    }
    ctx.stroke();
  },
  drawMouseDown: (...args) => {
    const [ tool,color,lineWidth,worldPos,setTempElement ] = args;
    setTempElement({
      type: tool,
      points: [worldPos, worldPos, worldPos, worldPos],
      color,
      lineWidth
    });
  },
  drawMouseMove: (...args) => {
    const [ worldPos,setTempElement ] = args;
    setTempElement(prev => {
      if (!prev || !prev.points || prev.points.length < 1) return prev;
      const p0 = prev.points[0];
      const p1 = { x: worldPos.x, y: p0.y };
      const p2 = { x: worldPos.x, y: worldPos.y };
      const p3 = { x: p0.x, y: worldPos.y };
      let points:Point[] = [];
      points = points.concat(interpolatePoints(p0, p1));
      points = points.concat(interpolatePoints(p1, p2));
      points = points.concat(interpolatePoints(p2, p3));
      points = points.concat(interpolatePoints(p3, p0));
      if (points.length > 0) {
        points.push({...points[0]});
      }
      return {
        ...prev,
        points
      };
    });
  }
}

const circle:ToolFn = {
  drawElement: (...args: [CanvasRenderingContext2D, Element]) => {
    const [ ctx,element ] = args;
    const validPoints = element.points.slice(1).filter(Boolean);
    if (validPoints.length < 2) return;
    ctx.beginPath();
    ctx.moveTo(validPoints[0].x, validPoints[0].y);
    for (let i = 1; i < validPoints.length; i++) {
      ctx.lineTo(validPoints[i].x, validPoints[i].y);
    }
    if (validPoints.length > 2) {
      const first = validPoints[0];
      const last = validPoints[validPoints.length - 1];
      if (Math.abs(first.x - last.x) < 1e-2 && Math.abs(first.y - last.y) < 1e-2) {
        ctx.closePath();
      }
    }
    ctx.stroke();
  },
  drawMouseDown: (...args) => {
    const [ tool,color,lineWidth,worldPos,setTempElement ] = args;
    setTempElement({
      type: tool,
      points: [worldPos],
      color,
      lineWidth
    });
  },
  drawMouseMove: (...args) => {
    const [ worldPos,setTempElement ] = args;
    const DIST_THRESHOLD = toolData.pointDistThreshold;
    setTempElement(prev => {
      if (!prev || !prev.points || prev.points.length < 1) return prev;
      const center = prev.points[0];
      const edge = worldPos;
      const radius = Math.sqrt(
        Math.pow(edge.x - center.x, 2) +
        Math.pow(edge.y - center.y, 2)
      );
      const circumference = 2 * Math.PI * radius;
      const steps = Math.max(24, Math.ceil(circumference / (DIST_THRESHOLD * 0.5)));
      const circlePoints = [];
      for (let i = 0; i < steps; i++) {
        const theta = (2 * Math.PI * i) / steps;
        circlePoints.push({
          x: center.x + radius * Math.cos(theta),
          y: center.y + radius * Math.sin(theta)
        });
      }
      if (circlePoints.length > 0) {
        circlePoints.push({...circlePoints[0]});
      }
      return {
        ...prev,
        points: [center, ...circlePoints]
      };
    });
  }
}

const elementEraser:ToolFn = {
  drawElement: ()=>{},
  drawMouseDown: ()=>{},
  drawMouseMove: (...args) => {
    const [worldPos, , elements, setElements, lineWidth] = args;
    const r = lineWidth / 2;
    const hitIndex = elements.findIndex(el => {
      if (!el.points || !Array.isArray(el.points)) return false;
      for (let i = 0; i < el.points.length - 1; i++) {
        const p1 = el.points[i];
        const p2 = el.points[i + 1];
        if (!p1 || !p2) continue;
        const d = distToSegment(worldPos, p1, p2);
        if (d <= r) return true;
      }
      return false;
    });
    if (hitIndex !== -1) {
      setElements(prev => prev.filter((_, i) => i !== hitIndex));
    }
  }
}

const normalEraser:ToolFn = {
  drawElement: ()=>{},
  drawMouseDown: ()=>{},
  drawMouseMove: (...args) => {
    const [worldPos, , ,setElements, lineWidth] = args;
    const r = lineWidth;
    setElements(prev => {
      let changed = false;
      const newElements = [];
      for (const el of prev) {
        if (!el.points || !Array.isArray(el.points)) {
          newElements.push(el);
          continue;
        }
        const points:(Point|null)[] = [...el.points];
        let erased = false;
        for (let i = 0; i < points.length - 1; i++) {
          const p1 = points[i];
          const p2 = points[i + 1];
          if (!p1 || !p2) continue;
          const d = distToSegment(worldPos, p1, p2);
          if (d <= r) {
            points[i+1] = null; // 标记为删除
            erased = true;
            changed = true;
            break;
          }
        }
        if (erased) {
          const segments = [];
          let seg = [];
          for (const pt of points) {
            if (pt) {
              seg.push(pt);
            } else {
              if (seg.length > 1) segments.push(seg);
              seg = [];
            }
          }
          if (seg.length > 1) segments.push(seg);
          for (const s of segments) {
            newElements.push({ ...el, points: s });
          }
        } else {
          newElements.push(el);
        }
      }
      return changed ? newElements : prev;
    });
  }
}

export const toolFn = { ballpointPen,rectangle,circle,elementEraser,normalEraser }