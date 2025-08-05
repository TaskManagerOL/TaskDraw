import { 
  mdiPencil,
  mdiEraser,
  mdiShapePlus,
  mdiFormatTextVariantOutline,
  mdiPen,
  mdiRectangleOutline,
  mdiCircleOutline,
  mdiCylinderOff,
  mdiEraserVariant
} from '@mdi/js';

class ToolModel {
  constructor(tool) {
    this.id = tool.id;
    this.name = tool.name;
    this.text = tool.text;
    this.icon = tool.icon;
    this.fn = tool.fn||null
    this.iconSize = tool.iconSize||null
    this.children = tool.children?.map(child => new ToolModel(child)) || [];;
  }

  toolLib(tool = this, arr = []) {
    if (tool.children) {
      tool.children.forEach(item => {
        if (item.children && item.children.length > 0)
          this.toolLib(item, arr);
        else
          arr.push(item);
      });
    }
    return arr;
  }
  
  findTool(value,order = 'name') {
    return this.children.find(firstTool => firstTool[order] === value)
  }

  updateTool(findFn, updateFn) {
    const stack = [this];
    while (stack.length > 0) {
      const node = stack.pop();
      if (node.children && node.children.length > 0)
        for (let i = node.children.length - 1; i >= 0; i--)
          stack.push(node.children[i])
      else if (findFn(node)) {
        if(updateFn)updateFn(node);
        return node
      }
    }
    return this
  }
}

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

const elementEraser = {
  drawElement: null,
  drawMouseDown: (...args) => {

  },
  drawMouseMove: (...args) => {
    
  }
}

//此处写tool树结构
const tool = {
  id: 1,
  name: 'root',
  text: '工具库',
  icon: null,
  children: [
    {
      id: 2,
      name: 'draw',
      text: '画笔工具',
      icon: mdiPencil,
      children: [
        { id: 3 ,name: 'ballpointPen', text: '圆珠笔', icon: mdiPen, fn: ballpointPen }
      ]
    },
    {
      id: 4,
      name: 'graphics',
      text: '绘图工具',
      icon: mdiShapePlus,
      children: [
        { id: 5,name: 'rectangle', text: '矩形', icon: mdiRectangleOutline, iconSize:1.25, fn: rectangle },
        { id: 6,name: 'circle', text: '圆形', icon: mdiCircleOutline, fn: circle }
      ]
    },{
      id: 7,
      name: 'eraser',
      text: '橡皮擦',
      icon: mdiEraser,
      children: [
        { id: 9,name: 'normalEraser', text: '普通橡皮', icon: mdiEraserVariant  },
        { id: 10,name: 'elementEraser', text: '元素橡皮', icon: mdiCylinderOff  },
      ]
    },{
      id: 8,
      name: 'text',
      text: '文本工具',
      icon: mdiFormatTextVariantOutline,
    }
  ]
}

const ToolLibrary = new ToolModel(tool);

export default ToolLibrary
