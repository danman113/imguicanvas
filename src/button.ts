import { Rectangle, intersection } from './rectangle'
import { Mouse } from './mouse'

export interface ButtonOptions extends Rectangle {
  color: string
  backgroundColor: string
  font?: string
  fontSize?: number
  label?: string
  padding: number
}

const ButtonOptionDefaults = {
  x: 0,
  y: 0,
  color: '#f1faee',
  backgroundColor: '#457b9d',
  font: 'sans-serif',
  fontSize: 16,
  label: '',
  padding: 4,
}

interface ButtonOutputs {
  clicked: boolean
  hovering: boolean
  down: boolean
}

const defaultButtonOutputs = {
  clicked: false,
  hovering: false,
  down: false,
}

type ButtonConfigFunction = (outputs: ButtonOutputs) => Partial<ButtonOptions>

export type Button = (options: Partial<ButtonOptions> | ButtonConfigFunction) => ButtonOutputs

const SimpleButtonFactory = (
  c: CanvasRenderingContext2D,
  key: string,
  mouse: Mouse,
  defaultOptions: Partial<ButtonOptions> = {}
): Button => {
  const optionDefaults: ButtonOptions = { ...ButtonOptionDefaults, ...defaultOptions }
  const Button = (option: Partial<ButtonOptions> | ButtonConfigFunction) => {
    let outputs: ButtonOutputs, textMeasurement: number
    // We need to compute this stuff first so we can detect mouse collision
    {
      let { x, y, width, height, label, font, fontSize, padding }: ButtonOptions = {
        ...optionDefaults,
        ...(option instanceof Function ? option(defaultButtonOutputs) : option),
      }
      if (fontSize && font) c.font = `${fontSize}px ${font}`
      const { width: _textMeasurement } = c.measureText(label)
      textMeasurement = _textMeasurement
      width = width ?? 2 * padding + textMeasurement
      height = height ?? 2 * padding + fontSize
      const mo = 0.5
      const hovering = intersection(
        { x, y, width, height },
        { x: mouse.x - mo, y: mouse.y - mo, width: mo, height: mo }
      )
      outputs = {
        hovering,
        clicked: hovering && mouse.clicked,
        down: hovering && mouse.buttons.some(Boolean),
      }
    }

    // Now we do this again for regular rendering, with the only real difference being that we pass
    // *outputs* to the option function
    let { x, y, label, padding, width, height, fontSize, backgroundColor, color }: ButtonOptions = {
      ...optionDefaults,
      ...(option instanceof Function ? option(outputs) : option),
    }

    // Allows for automatic width and height if not specified
    width = width ?? 2 * padding + textMeasurement
    height = height ?? 2 * padding + fontSize

    c.fillStyle = backgroundColor

    // This prevents weird offsets from occurring when textWidth = width
    const textWidth = Math.min(textMeasurement, width)
    c.fillRect(x, y, width, height)
    c.fillStyle = color
    c.fillText(label, x + width / 2 - textWidth / 2, y + height / 2 + fontSize / 2, width)
    return outputs
  }
  return Button
}

export default SimpleButtonFactory
