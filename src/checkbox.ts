import { Mouse } from './mouse'
import SimpleButtonFactory, { ButtonOptions } from './button'

interface CheckboxOutput {
  checked: boolean
}

const defaultCheckboxOutput = {
  checked: false
}

interface CheckboxOptions extends ButtonOptions {
  x: number
  y: number
  size: number
  default: boolean
}

const defaultCheckboxOptions = {
  x: 0,
  y: 0,
  size: 25,
}

type CheckboxConfigFunction = (outputs: CheckboxOutput) => Partial<CheckboxOptions>
export type Checkbox = (options: Partial<CheckboxOptions> | CheckboxConfigFunction) => CheckboxOutput

const checkboxState: Map<string, Map<number, boolean>> = new Map()

const CheckboxContext = (
  c: CanvasRenderingContext2D,
  key: string,
  mouse: Mouse,
  defaultOptions?: Partial<CheckboxOptions>
): Checkbox => {
  const newOptions = { ...defaultCheckboxOptions, ...defaultOptions }
  const button = SimpleButtonFactory(c, key, mouse)
  const currentCheckboxId = key
  let id = 0
  const checkbox: Checkbox = (options) => {
    const { size, default: def, ...finalOptions } = { ...newOptions, ...(options instanceof Function ? options(defaultCheckboxOutput) : options) }

    // We do this here so we don't allocate a new map for every new context unless it's used
    const factoryState: Map<number, boolean> = checkboxState.get(currentCheckboxId) ?? new Map()
    checkboxState.set(currentCheckboxId, factoryState)

    const stateId = id++
    const state = factoryState.get(stateId) ?? def

    const { clicked } = button(({ clicked, hovering }) => ({
      backgroundColor: !hovering ? 'grey' : 'lightgray',
      label: clicked != state ? 'X' : '',
      width: size,
      height: size,
      ...finalOptions,
    }))

    factoryState.set(stateId, clicked != state)
    return { checked: clicked != state } as CheckboxOutput
  }
  return checkbox
}

export default CheckboxContext
