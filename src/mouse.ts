export interface Mouse {
  x: number
  y: number
  buttons: boolean[]
  clicked: boolean,
  wheelDeltaX: number,
  wheelDeltaY: number
}

// @TODO: Figure out some way to make sure the mouse only clicks one thing at a time
// class MouseManager implements Mouse {
//   constructor(
//     public x = 0,
//     public y = 0,
//     public buttons: boolean[] = [],
//     public clicked = false,
//     public hoveredThisFrame = false
//   ) {}
//   update({ x, y, clicked, buttons }: Mouse) {
//     this.x = x
//     this.x = y
//     if (this.hoveredThisFrame)
//       this.clicked = false
//     else
//       this.hoveredThisFrame = true

//     return this
//   }
// }
