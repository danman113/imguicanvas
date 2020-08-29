import { Mouse } from './mouse'

export const setCanvasDimensions = (
  element: HTMLCanvasElement,
  maxWidth: number,
  maxHeight: number
) => {
  element.width = maxWidth
  element.height = maxHeight
  element.style.width = String(maxWidth) + 'px'
  element.style.height = String(maxHeight) + 'px'
}

const getWindowDimensions = () => {
  let width = window.innerWidth
  let height = window.innerHeight
  return [width, height]
}

export const fullscreenCanvas = (
  element: HTMLCanvasElement,
  hook: (UIEvent) => void = () => {}
) => {
  let dimensions = getWindowDimensions()
  setCanvasDimensions(element, dimensions[0], dimensions[1])

  window.addEventListener('resize', (e) => {
    dimensions = getWindowDimensions()
    setCanvasDimensions(element, dimensions[0], dimensions[1])
    hook(e)
  })
  return () => dimensions
}

export const setupMouseHandlers = (element: HTMLCanvasElement): (() => Mouse) => {
  let wheelDeltaX
  let wheelDeltaY
  const mouse: Mouse = {
    x: 0,
    y: 0,
    buttons: [],
    touches: new Map(),
    action: false,
    clicked: false,
    wheelDeltaX: 0,
    wheelDeltaY: 0,
  }

  let clickedThisPoll = false
  let downThisPoll = false
  element.addEventListener('mousemove', (e) => {
    if (e.offsetX || e.offsetY) {
      mouse.x = e.offsetX
      mouse.y = e.offsetY
    }
  })

  element.addEventListener('mousedown', (e) => {
    mouse.buttons[e.button] = true
    downThisPoll = true
  })

  element.addEventListener('mouseup', (e) => {
    mouse.buttons[e.button] = false
    clickedThisPoll = true
  })

  element.addEventListener('mouseleave', (e) => {
    mouse.buttons = []
  })

  element.addEventListener('mouseout', (e) => {
    mouse.buttons = []
  })

  element.addEventListener('blur', (e) => {
    mouse.buttons = []
  })

  element.addEventListener('wheel', (e) => {
    e.preventDefault()
    wheelDeltaX = e.deltaX
    wheelDeltaY = e.deltaY
  })

  element.addEventListener('touchstart', (e) => {
    e.preventDefault()
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i]
      mouse.touches.set(touch.identifier, touch)
    }
  })

  element.addEventListener('touchmove', (e) => {
    e.preventDefault()
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i]
      mouse.touches.set(touch.identifier, touch)
    }
  })

  element.addEventListener('touchcancel', (e) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i]
      mouse.touches.delete(touch.identifier)
      clickedThisPoll = true
      mouse.buttons[0] = false
    }
  })

  element.addEventListener('touchend', (e) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i]
      mouse.touches.delete(touch.identifier)
      clickedThisPoll = true
      mouse.buttons[0] = false
    }
  })

  element.addEventListener('contextmenu', (e) => e.preventDefault())
  element.addEventListener('dragenter', (e) => e.preventDefault())

  const poll = () => {
    for (let [_, touch] of mouse.touches) {
      mouse.x = touch.clientX
      mouse.y = touch.clientY
      downThisPoll = true
      mouse.buttons[0] = true
    }

    mouse.clicked = clickedThisPoll
    mouse.action = downThisPoll
    mouse.wheelDeltaX = wheelDeltaX
    mouse.wheelDeltaY = wheelDeltaY
    wheelDeltaX = 0
    wheelDeltaY = 0
    clickedThisPoll = false
    return mouse
  }
  return poll
}

export const draw = (cb: (dt: number) => void, fps: number = 60) => {
  let then = 0
  const func = (now: number = 0) => {
    const dt = (now - then) / (1000 / fps)
    then = now
    cb(dt)
    window.requestAnimationFrame(func)
  }
  return func
}
