// store
import { getAutoLayoutGapHandles } from 'store/design/utils/autoLayout/getAutoLayoutGapHandles/getAutoLayoutGapHandles';

// types
import { TDraftRect, TPoint } from 'types/canvas';
import { TFrameNode, TSceneNode } from 'types/design/types';

export type TAutoLayoutGapHit = {
  axis: 'horizontal' | 'vertical';
  fillRect: TDraftRect;
};

const isWithinTolerance = (localPoint: TPoint, fillRect: TDraftRect, toleranceWorldUnits: number): boolean => {
  const center: TPoint = { x: fillRect.x + fillRect.width / 2, y: fillRect.y + fillRect.height / 2 };

  return Math.hypot(localPoint.x - center.x, localPoint.y - center.y) <= toleranceWorldUnits;
};

const findNearestHandle = (localPoint: TPoint, fillRects: TDraftRect[], toleranceWorldUnits: number): TDraftRect | undefined =>
  fillRects.find((fillRect) => isWithinTolerance(localPoint, fillRect, toleranceWorldUnits));

export const getAutoLayoutGapHandleAtPoint = (
  localPoint: TPoint,
  frame: TFrameNode,
  children: TSceneNode[],
  toleranceWorldUnits: number,
): TAutoLayoutGapHit | null => {
  const handles = getAutoLayoutGapHandles(frame, children);
  const horizontalHit = findNearestHandle(localPoint, handles.horizontal, toleranceWorldUnits);
  const verticalHit = findNearestHandle(localPoint, handles.vertical, toleranceWorldUnits);
  const axis: TAutoLayoutGapHit['axis'] | null = horizontalHit ? 'horizontal' : verticalHit ? 'vertical' : null;

  switch (axis) {
    case 'horizontal':
      return { axis, fillRect: horizontalHit as TDraftRect };
    case 'vertical':
      return { axis, fillRect: verticalHit as TDraftRect };
    default:
      return null;
  }
};
