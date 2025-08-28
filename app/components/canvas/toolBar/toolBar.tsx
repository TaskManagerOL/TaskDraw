'use client'
import Icon from '@mdi/react';
import { createToolLibrary } from "../../../model/tool";
import type { ToolBar  } from "../../../model/type"

export default function ToolBar({
        tool,
        setTool,
        color,
        setColor,
        lineWidth,
        setLineWidth, 
        firstTool, 
        setFirstTool
    }:ToolBar) {
    const ToolLibrary = createToolLibrary()
    return (    //左侧工具栏，后续可以改成悬浮的
        <div className="w-10 absolute top-4 left-4 bg-[var(--toolbar-bg)] opacity-80 rounded-full px-3 py-2 flex flex-col justify-center items-center shadow-xl transition-all duration-800">
            <div className="flex gap-2 flex-col justify-center items-center">{/* 一级工具 */}
                {
                    ToolLibrary.children.map( item => {
                        return(
                            <button 
                                key={item.id}
                                className={`w-8 h-5 rounded-full flex justify-center items-center transition-all ${firstTool === item.name ? 'bg-[var(--primary)] h-8' : 'bg-[var(--toolbar-bg)]'}`}
                                onClick={() => {
                                    setFirstTool(item.name)
                                    setTool(item?.children[0]?item.children[0].name:item.name)
                                }}
                                title={item.text}
                            >
                                <Icon path={item.icon??''} size={1} />
                            </button>
                        )
                    })
                }
            </div>
            <div className="w-8 border-1 my-3 border-[var(--toolbar-border)]"></div>{/* 分割 */}
            <div className="w-7 flex flex-col justify-center items-center">{/* 二级工具 */}
                {
                    (firstTool=='draw'||firstTool=='graphics'||firstTool=='eraser')&&
                    (
                        <div className='flex flex-col justify-center items-center gap-2'>
                            {ToolLibrary.findTool(firstTool)?.children?.map( item => {
                                return(
                                    <button 
                                        key={item.id}
                                        className={`w-8 h-5 rounded-full flex justify-center items-center transition-all ${tool === item.name ? 'bg-[var(--primary)] h-8' : 'bg-[var(--toolbar-bg)]'}`}
                                        onClick={() => setTool(item.name)}
                                        title={item.text}
                                    >
                                        <Icon path={item.icon??''} size={item.name=='rectangle'?1.25:1} />
                                    </button>
                                )
                            })?? []}
                            <div className="w-8 border-1 my-3 border-[var(--toolbar-border)]"></div>{/* 分割 */}
                        </div>
                    )
                }
            </div>
            <div>{/* 颜色选择器 */}
                {   
                    (firstTool=='draw'||firstTool=='graphics')&&
                    <div className="flex flex-col justify-center items-center">   
                        
                        <input 
                            type="color" 
                            value={color} 
                            onChange={(e) => setColor(e.target.value)}
                            className="w-8 h-8 cursor-pointer"
                        />
                    </div>
                }
            </div>
            <div className="h-40 flex flex-col items-center relative">{/* 线条粗细选择器 */}
                <span className="absolute top-0 text-[#979797] text-xl">{lineWidth}</span>
                <input 
                    type="range" 
                    min="1" 
                    max="30" 
                    value={lineWidth} 
                    onChange={(e) => setLineWidth(parseInt(e.target.value))}
                    className="w-30 absolute bottom-15 rotate-90"
                    style={{ accentColor: 'var(--primary)' }}
                />
            </div>
        </div>
    )
}