import { Checkbox } from './../src/checkbox'
import { setupMouseHandlers } from './../src/utils'
import { init } from '../src'
import { fullscreenCanvas, draw } from '../src/utils'

const canvas = <HTMLCanvasElement>document.getElementById('canvas')
const pollCanvasDimensions = fullscreenCanvas(canvas)
const pollMouse = setupMouseHandlers(canvas)
const c = canvas.getContext('2d')
const { context, reset } = init(c)

let frame = 0
let showMovingButton = false
let hits = 0
const start = draw((dt) => {
  frame += dt
  const mouse = pollMouse()
  const [width, height] = pollCanvasDimensions()
  const { button, checkbox, container } = context('root', mouse)
  c.clearRect(0, 0, width, height)

  const { clicked } = button(({ hovering }) => ({
    label: JSON.stringify(mouse),
    x: 0,
    y: height - 70,
    fontSize: 20,
    backgroundColor: hovering ? 'blue' : 'red',
    color: hovering ? 'red' : 'blue',
    padding: hovering ? 20 : 15,
  }))
  if (clicked) alert(`You clicked on the button!`)

  const { checked } = checkbox({
    size: 40,
    x: width / 2 - 40 / 2,
    default: false,
  })

  if (checked) {
    const { checkbox, button } = container('hidden-weird-checkbox-toggler', {
      x: width / 4,
      y: height / 4,
      width: width / 2,
      height: height / 2,
    })
    const { checked } = checkbox({
      default: showMovingButton,
    })

    showMovingButton = checked

    const { clicked } = button({
      label: 'Reset Game',
      y: height / 4 + 50,
    })

    if (clicked) hits = 0

    if (showMovingButton) {
      const { button } = context('moving-button-context', mouse)
      const { clicked } = button(({ hovering, down }) => ({
        backgroundColor: [
          down && 'rgba(230, 40, 40, 0.8)',
          hovering && 'rgba(40, 40, 230, 0.8)',
          'rgba(20, 230, 40, 0.8)',
        ].find(Boolean),
        x: frame % width,
        y: 40,
        width: 30,
        height: 30,
      }))
      if (clicked) hits++

      c.fillStyle = 'black'
      c.font = `20px sans-serif`
      c.fillText(`Hits: ${hits}`, 0, 20)
    }
  } else {
    const { checkbox } = container('default-checkbox-container', {
      x: width / 4,
      y: height / 4,
      width: width / 2,
      height: height / 2,
    })

    for (let i = 0; i < 20; i++) {
      checkbox({
        y: height / 4 + i * 30,
      })
    }
  }

  reset()
})

start()
