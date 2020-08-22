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
  const { x, y, touches } = pollMouse()
  const [width, height] = pollCanvasDimensions()
  c.clearRect(0, 0, width, height)
  for (let [_, touch] of touches) {
    c.fillStyle = 'teal'
    c.fillRect(touch.clientX, touch.clientY, touch.radiusX * 2, touch.radiusY * 2)
  }
  context('root', ({ button, container }) => {
    const size = 400
    container('container1', { x, y: 0, width: size, height: size, color: 'black' }, ({ button }) => {
      button('thing', frame % size, 10, 50, 50 )
    })

    container('container5', { x: 0, y, width: size, height: size, color: 'red' }, ({ button }) => {
      button('thing', frame % size, 10, 50, 50 )
    })
  })

  render()
  c.restore()
})

start()
