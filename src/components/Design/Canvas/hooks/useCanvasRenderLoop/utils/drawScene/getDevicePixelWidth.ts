// types
import { TDrawSceneContext } from './types';

export const getDevicePixelWidth = (context: TDrawSceneContext, gl: WebGL2RenderingContext): number =>
  context.devicePixelWidth ?? gl.drawingBufferWidth;
