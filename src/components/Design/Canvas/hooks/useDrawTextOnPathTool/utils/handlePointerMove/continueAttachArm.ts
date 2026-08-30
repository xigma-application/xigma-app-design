import { RefObject } from 'react';

// others
import { TEXT_ON_PATH_ATTACH_SLOP_PX } from '../../../../constants';

// types
import { TPoint } from 'types/canvas';
import { TViewport } from 'types/design/types';

export const continueAttachArm = (
  start: TPoint,
  current: TPoint,
  viewport: TViewport,
  attachTargetIdRef: RefObject<string | null>,
): void => {
  const draggedPastSlop = Math.hypot(current.x - start.x, current.y - start.y) > TEXT_ON_PATH_ATTACH_SLOP_PX / viewport.zoom;

  if (attachTargetIdRef.current && draggedPastSlop) {
    attachTargetIdRef.current = null;
  }
};
