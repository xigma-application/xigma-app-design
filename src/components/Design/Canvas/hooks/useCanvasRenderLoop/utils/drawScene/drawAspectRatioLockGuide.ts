// others
import {
  ASPECT_RATIO_LOCK_GUIDE_DASH_GAP_PX,
  ASPECT_RATIO_LOCK_GUIDE_DASH_LENGTH_PX,
  ASPECT_RATIO_LOCK_GUIDE_STROKE,
} from 'constant/canvas';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TDrawSceneContext } from './types';

// utils
import { drawDashedLine } from 'utils/canvas/drawDashedLine';
import { rotatePoint } from 'utils/math/rotatePoint';

export const drawAspectRatioLockGuide = (context: TDrawSceneContext, refs: TCanvasRefs): void => {
  const guide = refs.transform.aspectRatioLockGuideRef.current;

  if (guide) {
    const { buffer, canvasHeight, canvasWidth, gl, program, viewport } = context;
    const center = { x: guide.x + guide.width / 2, y: guide.y + guide.height / 2 };
    const topLeft = rotatePoint({ x: guide.x, y: guide.y }, center, guide.rotation);
    const bottomRight = rotatePoint({ x: guide.x + guide.width, y: guide.y + guide.height }, center, guide.rotation);

    drawDashedLine(
      gl,
      program,
      buffer,
      { x1: topLeft.x, x2: bottomRight.x, y1: topLeft.y, y2: bottomRight.y },
      ASPECT_RATIO_LOCK_GUIDE_STROKE,
      1 / viewport.zoom,
      canvasWidth,
      canvasHeight,
      viewport,
      ASPECT_RATIO_LOCK_GUIDE_DASH_LENGTH_PX,
      ASPECT_RATIO_LOCK_GUIDE_DASH_GAP_PX,
    );
  }
};
