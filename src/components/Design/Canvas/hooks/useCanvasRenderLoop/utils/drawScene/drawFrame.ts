// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TDrawSceneContext } from './types';

// utils
import { drawDraftShape } from './drawDraftShape';

export const drawFrame = (context: TDrawSceneContext, refs: TCanvasRefs): void => {
  const { buffer, canvasHeight, canvasWidth, gl, imageContext, program, viewport } = context;
  const draftShape = refs.draftRef.current;

  if (draftShape) {
    drawDraftShape(gl, program, buffer, imageContext, draftShape, canvasWidth, canvasHeight, viewport);
  }
};
