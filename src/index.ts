import SimpleButtonFactory, { Button } from './button'
import { Mouse } from './mouse'
import CheckboxFactory, { Checkbox } from './checkbox'
import { ContainerFactory, Container } from './container'

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

export interface Context {
  button: Button
  checkbox: Checkbox
  container: Container
}

export type ContextFactory = (key: string, mouse: Mouse, defaultOptions?) => Context

export const init = (c: CanvasRenderingContext2D) => {
  const defaults = setDefaults(c)
  // @TODO: Weight the benefits of pushing the options to a stack vs rendering immediately
  // const renderList = []

  const reset = () => {
    resetDefaults(c, defaults)
  }

  const context: ContextFactory = (key, mouse, defaultOptions = {}) => {
    const button = SimpleButtonFactory(c, key, mouse, defaultOptions)
    const checkbox = CheckboxFactory(c, key, mouse, defaultOptions)
    const container = ContainerFactory(c, mouse, context)

    c.restore() // @TODO: Figure out a better place to put this?
    return {
      button,
      checkbox,
      container,
    }
  }

  return {
    reset,
    context,
  }
}
