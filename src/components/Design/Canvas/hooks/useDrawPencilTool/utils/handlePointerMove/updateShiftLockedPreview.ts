import { RefObject } from 'react';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TPoint } from 'types/canvas';

// utils
import { getAxisLockedPoint, TPencilAxis } from './getAxisLockedPoint';
import { getDominantAxis } from './getDominantAxis';
import { simplifyPencilPoints } from '../simplifyPencilPoints';

export const updateShiftLockedPreview = (
  refs: TCanvasRefs,
  committed: TPoint[],
  tail: TPoint[],
  axisLockRef: RefObject<TPencilAxis | null>,
  shiftAnchorRef: RefObject<TPoint | null>,
  currentPoint: TPoint,
  zoom: number,
  tolerance: number,
): void => {
  const anchor = shiftAnchorRef.current ?? tail[tail.length - 1];
  const axis = axisLockRef.current ?? getDominantAxis(anchor, currentPoint, zoom);

  shiftAnchorRef.current = anchor;
  axisLockRef.current = axis;

  const previewPoint = axis ? getAxisLockedPoint(anchor, currentPoint, axis) : currentPoint;
  const previewTail = simplifyPencilPoints([...tail, previewPoint], tolerance);

  refs.pencilPreviewPointsRef.current = [...committed, ...previewTail.slice(1)];
};
