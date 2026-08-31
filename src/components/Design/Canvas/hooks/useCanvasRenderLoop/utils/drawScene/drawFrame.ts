// types
import { NodeType } from 'types/design/enums';
import { TCanvasRefs } from 'types/design/canvas/types';
import { TImageRenderContext } from '../../types';
import { TViewport } from 'types/design/types';

// utils
import { drawDraftLine } from './drawDraftLine';
import { drawDraftShape } from './drawDraftShape';

export const drawFrame = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  imageContext: TImageRenderContext,
  refs: TCanvasRefs,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  const draftShape = refs.draftRef.current;

  if (draftShape) {
    if (draftShape.type === NodeType.line) {
      drawDraftLine(gl, program, buffer, draftShape, canvasWidth, canvasHeight, viewport);
    } else {
      drawDraftShape(gl, program, buffer, imageContext, draftShape, canvasWidth, canvasHeight, viewport);
    }
  }
};
