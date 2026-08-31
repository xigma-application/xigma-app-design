// types
import { TImageRenderContext } from '../../types';
import { TViewport } from 'types/design/types';

export type TDrawSceneContext = {
  buffer: WebGLBuffer;
  canvasHeight: number;
  canvasWidth: number;
  gl: WebGL2RenderingContext;
  imageContext: TImageRenderContext;
  program: WebGLProgram;
  viewport: TViewport;
};
