export default function Canvas({
    canvasRef,
    mouseHandlers
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