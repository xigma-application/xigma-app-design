// types
import { TImageRenderContext } from 'components/Design/Canvas/hooks/useCanvasRenderLoop/types';

// utils
import { drawBackground } from './drawBackground';

export const drawSceneBackground = (gl: WebGL2RenderingContext, imageContext: TImageRenderContext): void => {
  gl.colorMask(true, true, true, true);
  drawBackground(gl);
  gl.colorMask(true, true, true, false);
  imageContext.isAlphaWriteEnabled = false;
};
