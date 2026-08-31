// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TDrawSceneContext } from './types';

// utils
import { drawAlignmentGuide } from './drawAlignmentGuide';

export const drawTransformAlignmentGuide = (
  context: TDrawSceneContext,
  refs: TCanvasRefs,
  canvasWidth: number,
  canvasHeight: number,
): void => {
  const { buffer, gl, program, viewport } = context;

  drawAlignmentGuide(gl, program, buffer, refs.transform.alignmentGuideRef.current, canvasWidth, canvasHeight, viewport);
};
