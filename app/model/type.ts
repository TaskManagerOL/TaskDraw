import type { Dispatch, SetStateAction, RefObject } from 'react';

interface Point {
  x: number;
  y: number;
}

interface Element {
  type: string;
  points: Point[];
  color: string;
  lineWidth: number;
}

interface States {
  canvasRef: RefObject<HTMLCanvasElement>;
  viewport: Point;
  scale: number;
  isPanning: boolean;
  panStart: Point;
  tool: string;
  color: string;
  lineWidth: number;
  isDrawing: boolean;
  tempElement: Element;
  elements:  Element[];
  firstTool?: string;
  isRemoteUpdateRef?: RefObject<boolean|undefined>;
  bgBitmapRef?: RefObject<HTMLCanvasElement>;
  elementsBitmapRef?: RefObject<HTMLCanvasElement>;
}

interface Setters {
  setViewport: Dispatch<SetStateAction<Point>>;
  setScale: Dispatch<SetStateAction<number>>;
  setIsPanning: Dispatch<SetStateAction<boolean>>;
  setPanStart: Dispatch<SetStateAction<Point>>;
  setTool?: Dispatch<SetStateAction<string>>;
  setColor?: Dispatch<SetStateAction<string>>;
  setLineWidth?: Dispatch<SetStateAction<number>>;
  setIsDrawing: Dispatch<SetStateAction<boolean>>;
  setTempElement: Dispatch<SetStateAction<Element>>;
  setElements: Dispatch<SetStateAction<Element[]>>;
}

interface ToolBar {
  tool: string;
  setTool: Dispatch<SetStateAction<string>>;
  color: string;
  setColor: Dispatch<SetStateAction<string>>;
  lineWidth: number;
  setLineWidth: Dispatch<SetStateAction<number>>;
  firstTool: string;
  setFirstTool: Dispatch<SetStateAction<string>>;
}

interface ToolFn {
  drawElement: (
    ctx: CanvasRenderingContext2D,
    element: Element
  ) => void;

  drawMouseDown: (
    tool: string,
    color: string,
    lineWidth: number,
    worldPos: Point,
    setTempElement: (el: Element) => void,
  ) => void;

  drawMouseMove: (
    worldPos: Point,
    setTempElement: (updater: (prev: Element) => Element) => void,
    elements: Element[],
    setElements: (updater: (prev: Element[]) => Element[]) => void,
    lineWidth: number
  ) => void;
}

interface ToolInput {
  id:number,
  name:string,
  text:string,
  icon:string | null,
  fn?: ToolFn | null;
  children?: ToolInput[];
}

interface drawElementProps {
  (
    ctx: CanvasRenderingContext2D,
    element: Element,
    viewport: Point,
    scale: number,
    color: string,
    lineWidth: number
  ): void;
}

interface drawBackgroundProps {
  (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    viewport: Point,
    scale: number
  ): void;
}

interface redrawCanvasProps {
  (
    canvasRef: RefObject<HTMLCanvasElement>,
    elements: Element[],
    tempElement: Element,
    viewport: Point,
    scale: number,
    color: string,
    lineWidth: number,
    bgBitmap?: HTMLCanvasElement,
    elementsBitmap?: HTMLCanvasElement
  ): void;
}




export type { Element ,States, Setters, ToolBar, ToolInput, ToolFn, drawElementProps, drawBackgroundProps, redrawCanvasProps, Point };