const worldToScreen = (x, y , viewportX , viewportY ,scale) => {
    return {
        x: (x - viewportX) * scale,
        y: (y - viewportY) * scale
    };
};

// 坐标转换：屏幕坐标 -> 世界坐标
const screenToWorld = (x, y , viewportX , viewportY ,scale) => {
    return {
        x: (x / scale) + viewportX,
        y: (y / scale) + viewportY
    };
};

export { worldToScreen,screenToWorld }