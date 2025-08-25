import { useSearchParams, useRouter  } from 'next/navigation';

import CanvasMain from "./canvasMain/canvasMain";
import InfoBar from "./infoBar/infoBar";
import ToolBar from "./toolBar/toolBar";
import Room from "./room/room";

import useCanvas from "../../hook/useCanvas";
import useWebSocket from "../../hook/useWebSocket";

export default function Canvas() {
    const searchParams  = useSearchParams();
    const room = searchParams.get('room') ?? '';
    const router = useRouter();
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
        setFirstTool,
        elements,
        setElements
    } = useCanvas();

    const { 
        roomId,
        num
    } = useWebSocket({
        elements, 
        setElements,
        room,
        router,
        searchParams
    });
    
    return (
        <div className="w-screen h-screen relative">
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
            <Room
                roomId={roomId}
                num={num}
            />
        </div>
    );
}