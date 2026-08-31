// types
import { TImageRenderContext } from '../../types';
import { TViewport } from 'types/design/types';

export type TDrawSceneContext = {
  buffer: WebGLBuffer;
  gl: WebGL2RenderingContext;
  imageContext: TImageRenderContext;
  program: WebGLProgram;
  viewport: TViewport;
};
