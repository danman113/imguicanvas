// import { Checkbox } from './../src/checkbox'
import { setupMouseHandlers } from './../src/utils'
import { init } from '../src'
import { fullscreenCanvas, draw } from '../src/utils'

const canvas = <HTMLCanvasElement>document.getElementById('canvas')
const pollCanvasDimensions = fullscreenCanvas(canvas)
const pollMouse = setupMouseHandlers(canvas)
const c = canvas.getContext('2d')
const { context, render } = init(c)

let frame = 0
let showMovingButton = false
let hits = 0
const start = draw((dt) => {
  frame += dt
  const mouse = pollMouse()
  const [width, height] = pollCanvasDimensions()
  const { button, checkbox, container } = context('root')
  c.clearRect(0, 0, width, height)
  // const ctx = c
  // const { x, y } = mouse
  // ctx.beginPath();
  // ctx.arc(100, 75, 50, 0, Math.PI * 2);
  // ctx.clip();
  // ctx.fillStyle = 'blue';
  // ctx.fillRect(0, 0, width, height);
  // ctx.fillStyle = 'orange';
  // ctx.fillRect(0, 0, 100, 100);
  // ctx.restore()
  // c.save()
  // c.rect(mouse.x, mouse.y, 400, 400)
  // c.clip()
  // c.fillStyle = 'black'
  // c.fillRect(mouse.x, mouse.y, 400, 400)

  // c.fillStyle = 'blue'
  // c.fillRect(mouse.x + 0, mouse.y + 10, 50, 25)
  container('container1', mouse.x, mouse.y, 400, 400, 'black')
  button('first', 0, 10, 50, 50)
  // c.fillRect(frame, 40, 50, 50)
  
  render()
  c.restore()
})

start()
