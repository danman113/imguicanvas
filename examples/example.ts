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
let movingButtonY = 0
let hits = 0
let offset = 10
const start = draw((dt) => {
  frame += dt
  const mouse = pollMouse()
  const { x, y, touches } = mouse
  const [width, height] = pollCanvasDimensions()
  c.clearRect(0, 0, width, height)
  for (let [_, touch] of touches) {
    c.fillStyle = 'teal'
    c.fillRect(touch.clientX, touch.clientY, touch.radiusX * 2, touch.radiusY * 2)
  }

  context('root', ({ container, button }) => {
    const size = 400
    container(
      'container1',
      { x: 0, y: 0, width: size, height: size, color: 'black' },
      ({ button }) => {
        const { clicked } = button('thing', frame % size, offset, 50, 50)
        if (clicked) {
          showMovingButton = !showMovingButton
        }
      }
    )

    container(
      'container5',
      { x: 0, y: height / 2, width: size, height: size, color: 'teal' },
      ({ container }) => {
        container('container', {x: 0, y: 0, width: size, height: size / 2, color: 'green'}, ({ button }) => {
          const { scrollY, clicked, down } = button('thing', frame % size, 10, 50, 50)
          offset += scrollY
          if (clicked) hits++
          if (down) movingButtonY++
        })

        container('container2', {x: 0, y: size / 2, width: size / 2, height: size / 2, color: 'orange'}, ({ button }) => {
          const { clicked } = button('thing', frame % size / 2, 10, 50, 50)
          if (clicked) alert('yellow')
        })

        container('container3', {x: size / 2, y: size / 2, width: size / 2, height: size / 2, color: 'purple'}, ({ button }) => {
          const { clicked } = button('thing', frame % size / 2, 10, 50, 50)
          if (clicked) alert('purple')
        })
      }
    )

    if (showMovingButton) {
      const { scrollY, clicked, down } = button('thing', movingButtonY, 50, 50, 50)
      if (clicked) alert('Hello you clicked me')
    }
  })

  render(mouse)
  c.fillStyle = 'white'
  c.fillText(String(hits), 100, 100)
})

start()
