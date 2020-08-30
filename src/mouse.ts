export interface Mouse {
  x: number
  y: number
  buttons: boolean[]
  touches: Map<Number, Touch>
  action: boolean
  clicked: boolean
  wheelDeltaX: number
  wheelDeltaY: number
}
