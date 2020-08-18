// import SimpleButtonFactory, { Button } from './button'
import { Mouse } from './mouse'
// import CheckboxFactory, { Checkbox } from './checkbox'
// import { ContainerFactory, Container } from './container'

const defaults = {
  textBaseline: 'bottom',
}

const setDefaults = (c: CanvasRenderingContext2D) => {
  const opts = {}
  for (let [key, value] of Object.entries(defaults)) {
    opts[key] = c[key]
    c[key] = value
  }
  return opts
}

const resetDefaults = (c: CanvasRenderingContext2D, oldDefaults) => {
  for (let [key, value] of Object.entries(defaults)) {
    c[key] = value
  }
}

/*
Required Features:
  - Anonymous stateful widgets using the law of hooks
    - This should be solved right now using context() for each scope
    - Edge case: What about:
      button1 = context()
      cond1 = button1()
      // If just using counters, BOTH SHARE SAME STATE
      // @TODO: maybe mandate unique IDs per context. Perhaps this will remove the need for a `reset` call after all pages are used

      if cond1:
        button2 = context()
      else:
        button3 = context()
  - Will throw an error if you break the law of hooks
    - Look into this
  - Nested/Scroll-able containers that can
    - Try this soon
  - Easily Theme-able with sensible defaults
    - This should be easy to do with the setting the defaults during the context creation step
  - Able to write some relatively simple animation wrappers
    - WIP
  - ~200 complex widgets at 60fps on a chromebook
    - Working fine rn
  - Extendable, users should be able to add their own components
*/

/* Pipeline/Lifecycle Architecture (WIP)
    1. Init
      1. Sets up canvas invariants (font baseline, .etc)
    2. GUI Setup
      1. The user tells us which
    3. GUI Render/Cleanup
      1. Renders stuff
      2. Resets canvas invariants
*/

class Button {
  constructor(
    public key,
    public x = 0,
    public y = 0,
    public width = 0,
    public height = 0,
    public color = 'blue',
    public hoverColor = 'red',
    public textColor = 'white'
  ) {}
  static factory(push) {
    return (key: string, x: number, y: number, width: number, height: number, ...args) =>
      push(new Button(key, x, y, width, height, ...args))
  }

  render (c: CanvasRenderingContext2D, container: Dimensions) {
    c.fillStyle = this.color
    c.fillRect(container.x + this.x, container.y + this.y, this.width, this.height)
  }
}

class Checkbox {
  constructor() {}
}

interface Dimensions {
  x: number,
  y: number,
  width: number,
  height: number
}

class Container {
  constructor(public key, public x = 0, public y = 0, public width = 0, public height = 0, public color = 'white') {}
  
  render(c: CanvasRenderingContext2D, container: Dimensions) {
    const x = Math.max(this.x, container.x)
    const y = Math.max(this.y, container.y)
    const containerX = container.x + container.width
    const containerY = container.y + container.height
    // console.log(x, y, Math.min(this.width, containerX - x), Math.min(this.height, containerY - y))
    c.save()
    c.rect(x, y, Math.min(this.width, containerX - x), Math.min(this.height, containerY - y))
    c.clip()
    c.fillStyle = this.color
    c.fillRect(this.x, this.y, this.width, this.height)
  }

  static factory(push) {
    return (key, ...args) => push(new Container(key, ...args))
  }
}

export interface Context {
  button: (key: string, x: number, y: number, width: number, height: number) => void
  checkbox: () => void
  container: () => void
}

export type ContextFactory = (key: string) => Context

export const init = (c: CanvasRenderingContext2D) => {
  const defaults = setDefaults(c)
  let renderList = []
  const push = (...rest) => renderList.push(...rest)

  const render = () => {
    let currentContext = { x: 0, y: 0, width: 2000, height: 2000 }
    c.restore()
    for (let renderable of renderList) {
      renderable.render(c, currentContext)
      if (renderable instanceof Container) {
        currentContext = renderable
      }
    }

    
    renderList = []
  }

  const context: ContextFactory = (key) => {
    return {
      key,
      button: Button.factory(push),
      checkbox: () => {},
      container: Container.factory(push),
    }
  }

  return {
    render,
    context,
  }
}
