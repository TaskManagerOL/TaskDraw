export default function InfoBar({
        tool,
        viewport,
        scale
    }:{
        tool: string,
        viewport: {x: number, y: number},
        scale: number
    }){
    return (
        <div className="fixed flex bottom-4 right-4 text-white text-sm">
            <div className="mt-2 text-xs text-gray-400">
                位置: ({viewport.x.toFixed(0)}, {viewport.y.toFixed(0)}) | 缩放: {scale.toFixed(2)}x | 当前工具: {tool}
            </div>
        </div>
    )
}