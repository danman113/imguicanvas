export interface Rectangle {
  x: number
  y: number
  width?: number
  height?: number
}

export const intersection = (a: Rectangle, b: Rectangle) => {
  const rect1x = a.x
  const rect1y = a.y
  const rect1w = a.width
  const rect1h = a.height
  const rect2x = b.x
  const rect2y = b.y
  const rect2w = b.width
  const rect2h = b.height
  return (
    rect1x + rect1w > rect2x &&
    rect1x < rect2x + rect2w &&
    rect1y + rect1h > rect2y &&
    rect1y < rect2y + rect2h
  )
}
