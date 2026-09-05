// types
import { TImageRenderContext } from '../../types';
import { TViewport } from 'types/design/types';

export type TDrawContext = {
  buffer: WebGLBuffer;
  canvasHeight: number;
  canvasWidth: number;
  gl: WebGL2RenderingContext;
  program: WebGLProgram;
  viewport: TViewport;
};

export type TDrawSceneContext = TDrawContext & {
  imageContext: TImageRenderContext;
};
