import {
  mdiPencil,
  mdiEraser,
  mdiShapePlus,
  mdiPen,
  mdiRectangleOutline,
  mdiCircleOutline,
  mdiCylinderOff,
  mdiEraserVariant
} from '@mdi/js';

import { toolFn } from '../utils/toolFn'
import { ToolInput,ToolFn } from './type';

type ToolKey = keyof ToolModel; 

class ToolModel {
  public readonly id: number;
  public readonly name: string;
  public readonly text: string;
  public readonly icon: string | null;
  public readonly fn?: ToolFn | null;
  public readonly children: ToolModel[];
  constructor(tool:ToolInput) {
    this.id = tool.id;
    this.name = tool.name;
    this.text = tool.text;
    this.icon = tool.icon;
    this.fn = tool.fn||null
    this.children = tool.children?.map(child => new ToolModel(child)) || [];;
  }

  toolLib(tool: ToolModel = this, arr: ToolModel[] = []): ToolModel[] {
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

  findTool(value:string,order:ToolKey = 'name') {
    return this.children.find(firstTool => firstTool[order] === value)
  }

  updateTool(findFn:(tool: ToolInput)=> boolean, updateFn:((tool: ToolInput)=> void)|null) {
    const stack: ToolInput[] = [this];
    while (stack.length > 0) {
      const node = stack.pop()!;
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

//此处写tool树结构
const tool:ToolInput = {
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
        { id: 3 ,name: 'ballpointPen', text: '圆珠笔', icon: mdiPen, fn: toolFn.ballpointPen }
      ]
    },
    {
      id: 4,
      name: 'graphics',
      text: '绘图工具',
      icon: mdiShapePlus,
      children: [
        { id: 5,name: 'rectangle', text: '矩形', icon: mdiRectangleOutline, fn: toolFn.rectangle },
        { id: 6,name: 'circle', text: '圆形', icon: mdiCircleOutline, fn: toolFn.circle }
      ]
    },
    {
      id: 7,
      name: 'eraser',
      text: '橡皮擦',
      icon: mdiEraser,
      children: [
        { id: 9,name: 'normalEraser', text: '普通橡皮', icon: mdiEraserVariant, fn: toolFn.normalEraser },
        { id: 10,name: 'elementEraser', text: '元素橡皮', icon: mdiCylinderOff, fn: toolFn.elementEraser  },
      ]
    },
    // {
    //   id: 8,
    //   name: 'text',
    //   text: '文本工具',
    //   icon: mdiFormatTextVariantOutline,
    //   fn: toolFn.text
    // }
  ]
}

//这里使用简单的工厂设计模式逻辑，确保ws连接的时候用户使用的toolmodel不会相互影响。
export const createToolLibrary = () => new ToolModel(tool);