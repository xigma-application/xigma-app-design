// types
import { TImageRenderContext } from 'components/Design/Canvas/hooks/useCanvasRenderLoop/types';

export const setAlphaWriteEnabled = (gl: WebGL2RenderingContext, imageContext: TImageRenderContext, enabled: boolean): void => {
  gl.colorMask(true, true, true, enabled);
  imageContext.isAlphaWriteEnabled = enabled;
};
