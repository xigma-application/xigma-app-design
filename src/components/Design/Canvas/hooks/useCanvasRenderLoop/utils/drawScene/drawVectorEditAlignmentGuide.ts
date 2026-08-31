// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TDrawSceneContext } from './types';

// utils
import { drawAlignmentGuide } from './drawAlignmentGuide';

export const drawVectorEditAlignmentGuide = (context: TDrawSceneContext, refs: TCanvasRefs): void => {
  const { buffer, canvasHeight, canvasWidth, gl, program, viewport } = context;

  drawAlignmentGuide(gl, program, buffer, refs.vectorEdit.vectorAlignmentGuideRef.current, canvasWidth, canvasHeight, viewport);
};
