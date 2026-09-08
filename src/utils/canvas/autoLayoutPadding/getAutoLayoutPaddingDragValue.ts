// types
import { TAutoLayoutPaddingDragState } from 'types/design/canvas/types';
import { TAutoLayoutPaddingSide } from './types';
import { TDraftRect, TPoint } from 'types/canvas';
import { TFrameNode } from 'types/design/types';

// utils
import { getUnrotatedQueryPoint } from 'components/Design/Canvas/utils/getUnrotatedQueryPoint';

const DELTA_SIGN_BY_SIDE: Record<TAutoLayoutPaddingSide, 1 | -1> = { bottom: -1, left: 1, right: -1, top: 1 };

const ABSOLUTE_VALUE_BY_SIDE: Record<TAutoLayoutPaddingSide, (frame: TDraftRect, point: TPoint) => number> = {
  bottom: (frame, point) => frame.y + frame.height - point.y,
  left: (frame, point) => point.x - frame.x,
  right: (frame, point) => frame.x + frame.width - point.x,
  top: (frame, point) => point.y - frame.y,
};

export const getAutoLayoutPaddingDragValue = (dragState: TAutoLayoutPaddingDragState, frame: TFrameNode, localPoint: TPoint): number => {
  if (dragState.mode === 'absolute') {
    return Math.max(0, ABSOLUTE_VALUE_BY_SIDE[dragState.side](frame, localPoint));
  }

  const localPointerStart = getUnrotatedQueryPoint(dragState.pointerStart, frame, frame.rotation);
  const axisDelta =
    dragState.side === 'top' || dragState.side === 'bottom' ? localPoint.y - localPointerStart.y : localPoint.x - localPointerStart.x;

  return Math.max(0, dragState.originalPaddingValue + DELTA_SIGN_BY_SIDE[dragState.side] * axisDelta);
};
