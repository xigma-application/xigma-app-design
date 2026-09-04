// others
import { FRAME_DROP_TARGET_STROKE } from 'constant/canvas';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TDrawSceneContext } from './types';

// utils
import { drawRect } from 'utils/canvas/drawRect/drawRect';

export const drawAutoLayoutDropIndicator = (context: TDrawSceneContext, refs: TCanvasRefs): void => {
  const { buffer, canvasHeight, canvasWidth, gl, program, viewport } = context;
  const dropTarget = refs.transform.autoLayoutDropTargetRef.current;

  if (dropTarget) {
    drawRect(gl, program, buffer, { ...dropTarget.indicator, fill: FRAME_DROP_TARGET_STROKE }, canvasWidth, canvasHeight, viewport, 0);
  }
};
