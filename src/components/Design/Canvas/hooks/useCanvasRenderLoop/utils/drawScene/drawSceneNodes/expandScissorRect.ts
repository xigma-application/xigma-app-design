// types
import { TScissorRect } from './types';

export const expandScissorRect = (gl: WebGL2RenderingContext, rect: TScissorRect, amount: number): TScissorRect => {
  const left = Math.max(0, rect.x - amount);
  const bottom = Math.max(0, rect.y - amount);
  const right = Math.min(gl.drawingBufferWidth, rect.x + rect.width + amount);
  const top = Math.min(gl.drawingBufferHeight, rect.y + rect.height + amount);

  return { height: top - bottom, width: right - left, x: left, y: bottom };
};
