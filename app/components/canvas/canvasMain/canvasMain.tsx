export default function Canvas({
    canvasRef,
    mouseHandlers
  }) {
  return(
    <canvas
      ref={canvasRef}
      className="absolute inset-0"
      onMouseDown={mouseHandlers.handleMouseDown}
      onMouseMove={mouseHandlers.handleMouseMove}
      onMouseUp={mouseHandlers.handleMouseUp}
      onMouseLeave={mouseHandlers.handleMouseUp}
      onWheel={mouseHandlers.handleWheel}
      onContextMenu={(e) => e.preventDefault()}
    />
  )
}