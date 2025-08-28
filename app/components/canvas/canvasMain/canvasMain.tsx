export default function Canvas({
    canvasRef,
    mouseHandlers
  }:{
    canvasRef: React.RefObject<HTMLCanvasElement>,
    mouseHandlers: {
      handleMouseDown: (e: React.MouseEvent | React.TouchEvent) => void,
      handleMouseMove: (e: React.MouseEvent | React.TouchEvent) => void,
      handleMouseUp: (e: React.MouseEvent | React.TouchEvent) => void,
      handleWheel: (e: React.WheelEvent) => void,
    }
  }) {
  return(
    <canvas
      ref={canvasRef}
      className="absolute inset-0"
      onMouseDown={mouseHandlers.handleMouseDown}
      onTouchStart={mouseHandlers.handleMouseDown}
      onMouseMove={mouseHandlers.handleMouseMove}
      onTouchMove={mouseHandlers.handleMouseMove}
      onMouseUp={mouseHandlers.handleMouseUp}
      onTouchEnd={mouseHandlers.handleMouseUp}
      onMouseLeave={mouseHandlers.handleMouseUp}
      onTouchCancel={mouseHandlers.handleMouseUp}
      onWheel={mouseHandlers.handleWheel}
      onContextMenu={(e) => e.preventDefault()}
    />
  )
}