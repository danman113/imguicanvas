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

const CONTEXT_SEPARATOR = '|'

interface GUIComponent {
  render(c: CanvasRenderingContext2D, container?: Dimensions)
}

interface GUIComponentStatic {
  new (): GUIComponent
  factory(push: (...rest: any[]) => void, contextKey: string, contextFactory?: ContextFactory)
}

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
  static factory(push, contextKey = '', contextFactory?: ContextFactory) {
    return (key: string, x: number, y: number, width: number, height: number, ...args) =>
      push(
        new Button(
          contextKey ? contextKey + CONTEXT_SEPARATOR + key : key,
          x,
          y,
          width,
          height,
          ...args
        )
      )
  }

  render(c: CanvasRenderingContext2D, container: Dimensions) {
    c.fillStyle = this.color
    c.fillRect(container.x + this.x, container.y + this.y, this.width, this.height)
  }
}

class Checkbox {
  constructor() {}
}

interface Dimensions {
  x: number
  y: number
  width: number
  height: number
}

class Container {
  public globalDimensions: Dimensions
  public x: number = 0
  public y: number = 0
  public width: number = 0
  public height: number = 0
  public color: string = 'white'
  constructor(
    public key: string,
    { x, y, width, height, color}
  ) {
    Object.assign(this, {key, x, y, width, height, color})
    this.globalDimensions = {
      x,
      y,
      width,
      height,
    }
  }

  subset(container: Dimensions) {
    const x = this.x + container.x
    const y = this.y + container.y
    this.globalDimensions.x = x
    this.globalDimensions.y = y
    this.globalDimensions.width = Math.min(this.width, container.width)
    this.globalDimensions.height = Math.min(this.height, container.height)
  }

  render(c: CanvasRenderingContext2D, container: Dimensions) {
    this.subset(container)
    c.restore()
    c.save()
    c.beginPath()
    c.rect(
      this.globalDimensions.x,
      this.globalDimensions.y,
      this.globalDimensions.width,
      this.globalDimensions.height
    )
    c.clip()
    c.fillStyle = this.color
    c.fillRect(
      this.globalDimensions.x,
      this.globalDimensions.y,
      this.globalDimensions.width,
      this.globalDimensions.height
    )
  }

  static factory(push, contextKey = '', contextFactory: ContextFactory) {
    return (key, options, callback) => {
      const derivedKey = contextKey ? contextKey + CONTEXT_SEPARATOR + key : key
      push(new Container(derivedKey, options))
      contextFactory(derivedKey, callback)
    }
  }
}

export interface Context {
  button: (key: string, x: number, y: number, width: number, height: number) => void
  checkbox: () => void
  container: () => void
}

export type ContextFactory = (key: string, callback: Function) => void

export const init = (c: CanvasRenderingContext2D) => {
  const defaults = setDefaults(c)
  let renderList: GUIComponent[] = []
  let oldRenderedList = []
  let contextStack = []
  let state = new Map<string, any>()
  const push = (...rest: any[]) => {
    renderList.push(...rest)
  }

  const render = () => {
    console.log(renderList)
    let currentContext = { x: 0, y: 0, width: Infinity, height: Infinity }
    for (let renderable of renderList) {
      renderable.render(c, currentContext)
      if (renderable instanceof Container) {
        currentContext = renderable.globalDimensions
        contextStack.push(renderable.globalDimensions)
      }
    }
    // Look at this later to see if it actually affects performance
    oldRenderedList = renderList
    renderList = []
    contextStack = []
  }

  const contextFactory: ContextFactory = (key: string, callback: Function) => {
    callback({
      key,
      // @TODO: Make this generic
      button: Button.factory(push, key, contextFactory),
      checkbox: () => {},
      container: Container.factory(push, key, contextFactory),
    })
  }

  return {
    render,
    context: contextFactory,
  }
}
