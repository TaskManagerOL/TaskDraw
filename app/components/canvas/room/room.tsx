export default function Room({
    roomId,
    num
    }){
    return (//这里或许可以加个复制房间号的功能，点击复制
      <div className="absolute top-4 right-4 bg-[var(--toolbar-bg)] opacity-10 rounded-full px-3 py-2 flex flex-col justify-center items-center shadow-xl transition-all duration-800 hover:opacity-100">
        { roomId &&
          <div className="text-[var(--text-color)] text-sm flex flex-col justify-center items-center">
            <div>房间号:{roomId}</div>
            <div>在线人数:{num}</div>
          </div>
        }
      </div>
    )
}