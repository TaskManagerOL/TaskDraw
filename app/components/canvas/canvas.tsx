
import CanvasMain from "./canvasMain/canvasMain";
import InfoBar from "./infoBar/infoBar";
import ToolBar from "./toolBar/toolBar";
import useCanvas from "../../hook/useCanvas";

export default function Canvas() {
    const {
        canvasRef,
        mouseHandlers,
        tool,
        setTool,
        color,
        setColor,
        lineWidth,
        setLineWidth,
        viewport,
        scale,
        firstTool,
        setFirstTool
    } = useCanvas();
    
    return (
        <div>
            <CanvasMain
                canvasRef={canvasRef}
                mouseHandlers={mouseHandlers}
            />
            <ToolBar
                tool={tool}
                setTool={setTool}
                color={color}
                setColor={setColor}
                lineWidth={lineWidth}
                setLineWidth={setLineWidth}
                firstTool={firstTool}
                setFirstTool={setFirstTool}
            />
            <InfoBar
                viewport={viewport}
                scale={scale}
                tool={tool}
            />
        </div>
    );
}