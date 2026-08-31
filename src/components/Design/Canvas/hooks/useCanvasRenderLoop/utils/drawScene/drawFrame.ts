// types
import { NodeType } from 'types/design/enums';
import { TCanvasRefs } from 'types/design/canvas/types';
import { TDrawSceneContext } from './types';

// utils
import { drawDraftLine } from './drawDraftLine';
import { drawDraftShape } from './drawDraftShape';

export const drawFrame = (context: TDrawSceneContext, refs: TCanvasRefs, canvasWidth: number, canvasHeight: number): void => {
  const { buffer, gl, imageContext, program, viewport } = context;
  const draftShape = refs.draftRef.current;

  if (draftShape) {
    if (draftShape.type === NodeType.line) {
      drawDraftLine(gl, program, buffer, draftShape, canvasWidth, canvasHeight, viewport);
    } else {
      drawDraftShape(gl, program, buffer, imageContext, draftShape, canvasWidth, canvasHeight, viewport);
    }
  }
};
