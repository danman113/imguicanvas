import { Context, ContextFactory } from './index'
import { Mouse } from './mouse'

interface ContainerOptions {
  x: number
  y: number
  width: number
  height: number
  backgroundColor?: string
  draggable?: boolean
}

const defaultContainerOptions = {
  backgroundColor: 'rgba(20, 130, 20, 0.4)',
}

export type Container = (key: string, options: ContainerOptions) => Context

export const ContainerFactory = (
  c: CanvasRenderingContext2D,
  mouse: Mouse,
  contextFactory: ContextFactory,
  defaultOverrides?: Partial<ContainerOptions>
): Container => {
  const newOptions = { ...defaultContainerOptions, ...defaultOverrides }
  const container: Container = (key, options) => {
    const { x, y, width, height, backgroundColor } = { ...newOptions, ...options }
    const context = contextFactory(key, mouse, { x, y })
    c.save()
    c.rect(x, y, width, height)
    c.clip()
    c.fillStyle = backgroundColor
    c.fillRect(x, y, width, height)
    return context
  }

  return container
}
