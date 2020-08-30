// import SimpleButtonFactory, { Button } from './button'
import { Mouse } from './mouse'
import { intersection } from './rectangle'
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

class GUIComponent {
  public key: string = ''
  public contextKey: string = ''
  render(c: CanvasRenderingContext2D, container?: Box, state?: State) {}
  update(mouse: Mouse, container?: Box) {}
  static defaultState = {}
  static factory(
    push: (...rest: any[]) => void,
    contextKey: string,
    state?: State,
    contextFactory?: ContextFactory
  ) {}
}

type State = Map<string, any>

interface ButtonProps extends Box {
  backgroundColor?: string
  textColor?: string
}

interface ButtonState {
  hovering: boolean
  scrollX: number
  scrollY: number
  clicked: boolean
  down: boolean
}

type ButtonPropFunction = (state: ButtonState) => ButtonProps
type ButtonArg = ButtonProps | ButtonPropFunction
type ButtonFactory = (key: string, props: ButtonArg) => ButtonState

class Button implements GUIComponent {
  static defaultProps: ButtonPropFunction = (state) => ({
    x: 0,
    y: 0,
    width: 10,
    height: 10,
    backgroundColor: state.hovering ? 'red' : 'blue',
  })
  constructor(public key, public contextKey, public props: ButtonArg) {}
  static factory(
    push,
    contextKey = '',
    state: State,
    contextFactory?: ContextFactory
  ): ButtonFactory {
    return (key, props) => {
      const globalKey = contextKey ? contextKey + CONTEXT_SEPARATOR + key : key
      push(new Button(globalKey, contextKey, props))
      return state.get(globalKey) || Button.defaultState
    }
  }

  computeProps(state: ButtonState) {
    return Object.assign(
      {},
      Button.defaultProps(state),
      typeof this.props === 'function' ? this.props(state) : this.props
    )
  }

  render(c: CanvasRenderingContext2D, container: Box, state: any) {
    const { x, y, width, height, backgroundColor } = this.computeProps(state)
    c.fillStyle = backgroundColor
    c.fillRect(container.x + x, container.y + y, width, height)
  }

  static defaultState = {
    hovering: false,
    scrollX: 0,
    scrollY: 0,
    clicked: false,
    down: false,
  }

  update(mouse: Mouse, container: Box) {
    const { x, y, width, height } = this.computeProps(Button.defaultState)
    const mo = 0.5
    const mouseBox = { x: mouse.x - mo, y: mouse.y - mo, width: mo, height: mo }
    const hovering =
      intersection(
        {
          x: container.x + x,
          y: container.y + y,
          width: width,
          height: height,
        },
        mouseBox
      ) && intersection(container, mouseBox)

    const { wheelDeltaX, wheelDeltaY } = mouse
    const scrollX = hovering ? wheelDeltaX : 0
    const scrollY = hovering ? wheelDeltaY : 0

    return {
      hovering,
      scrollX,
      scrollY,
      clicked: hovering && mouse.clicked,
      down: hovering && mouse.buttons.some(Boolean),
    }
  }
}

class Checkbox {
  constructor() {}
}

interface Box {
  x: number
  y: number
  width: number
  height: number
}

export class ContextContainer extends GUIComponent {
  public globalBoundary: Box
  constructor(
    public key: string = '',
    public contextKey: string = '',
    public props: Box = { x: 0, y: 0, width: Infinity, height: Infinity }
  ) {
    super()
    this.globalBoundary = props
  }
}

export interface ContextArguments {
  button: ButtonFactory
  container: ContainerFactory
}

export type ContextFunction = (args: ContextArguments) => void

export type ContextFactory = (key: string, callback: ContextFunction) => void

export interface ContainerProps extends Box {
  color?: string
}

export type ContainerFactory = (
  key: string,
  props: ContainerProps,
  callback: ContextFunction
) => ContainerState

export type ContainerState = any

class Container extends ContextContainer {
  public globalBoundary: Box
  constructor(public key: string, public contextKey: string, public props: ContainerProps) {
    super()
    const { x, y, width, height } = props
    this.globalBoundary = {
      x,
      y,
      width,
      height,
    }
  }

  subset(container: Box) {
    const { x: _x, y: _y, width, height } = this.props
    const x = _x + container.x
    const y = _y + container.y
    this.globalBoundary.x = x
    this.globalBoundary.y = y
    this.globalBoundary.width = Math.min(width, container.width)
    this.globalBoundary.height = Math.min(height, container.height)
  }

  render(c: CanvasRenderingContext2D, container: Box, state: any) {
    this.subset(container)
    c.beginPath()
    c.rect(
      this.globalBoundary.x,
      this.globalBoundary.y,
      this.globalBoundary.width,
      this.globalBoundary.height
    )
    c.clip()
    c.fillStyle = this.props.color
    c.fillRect(
      this.globalBoundary.x,
      this.globalBoundary.y,
      this.globalBoundary.width,
      this.globalBoundary.height
    )
  }

  static factory(
    push,
    contextKey = '',
    state: State,
    contextFactory: ContextFactory
  ): ContainerFactory {
    return (key, options, callback) => {
      const derivedKey = contextKey ? contextKey + CONTEXT_SEPARATOR + key : key
      push(new Container(derivedKey, contextKey, options))
      contextFactory(derivedKey, callback)
      return state.get(derivedKey) || Container.defaultState
    }
  }
}

export const init = (c: CanvasRenderingContext2D) => {
  const defaults = setDefaults(c)
  let renderList: GUIComponent[] = []
  let state: State = new Map()
  const push = (...rest: any[]) => {
    renderList.push(...rest)
  }

  const render = (mouse: Mouse) => {
    c.save()
    const contextMap = new Map()
    let currentContext = null
    for (let renderable of renderList) {
      if (currentContext !== renderable.contextKey) {
        c.restore()
        c.save()
      }
      renderable.render(
        c,
        contextMap.get(renderable.contextKey),
        state.get(renderable.key) || (renderable.constructor as any).defaultState
      )

      if (renderable instanceof ContextContainer) {
        currentContext = renderable.key
        contextMap.set(renderable.key, renderable.globalBoundary)
      }
    }

    for (let renderable of renderList) {
      if (renderable.key) {
        state.set(
          renderable.key,
          renderable.update(mouse, contextMap.get((renderable as any).contextKey))
        )
      }
    }
    // Look at this later to see if it actually affects performance
    renderList.length = 0
    c.restore()
  }

  const contextFactory: ContextFactory = (key: string, callback: Function) => {
    callback({
      key,
      // @TODO: Make this generic
      button: Button.factory(push, key, state, contextFactory),
      checkbox: () => {},
      container: Container.factory(push, key, state, contextFactory),
    })
  }

  const context: ContextFactory = (key, callback) => {
    push(new ContextContainer(key))
    return contextFactory(key, callback)
  }

  return {
    render,
    context,
  }
}
