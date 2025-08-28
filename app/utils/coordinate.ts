const worldToScreen = (
    x:number, 
    y:number,
    viewportX:number,
    viewportY:number,
    scale:number
) => {
    return {
        x: (x - viewportX) * scale,
        y: (y - viewportY) * scale
    };
};

// 坐标转换：屏幕坐标 -> 世界坐标
const screenToWorld = (
    x:number, 
    y:number,
    viewportX:number,
    viewportY:number,
    scale:number
) => {
    return {
        x: (x / scale) + viewportX,
        y: (y / scale) + viewportY
    };
};

export { worldToScreen,screenToWorld }