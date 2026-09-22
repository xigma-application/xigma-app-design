// types
import { TDrawSceneContext } from './types';

export const getDevicePixelHeight = (context: TDrawSceneContext, gl: WebGL2RenderingContext): number =>
  context.devicePixelHeight ?? gl.drawingBufferHeight;
