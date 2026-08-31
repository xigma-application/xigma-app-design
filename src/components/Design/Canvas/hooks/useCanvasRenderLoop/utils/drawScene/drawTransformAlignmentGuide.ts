// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TDrawSceneContext } from './types';

// utils
import { drawAlignmentGuide } from './drawAlignmentGuide';

export const drawTransformAlignmentGuide = (context: TDrawSceneContext, refs: TCanvasRefs): void => {
  const { buffer, canvasHeight, canvasWidth, gl, program, viewport } = context;

  drawAlignmentGuide(gl, program, buffer, refs.transform.alignmentGuideRef.current, canvasWidth, canvasHeight, viewport);
};
