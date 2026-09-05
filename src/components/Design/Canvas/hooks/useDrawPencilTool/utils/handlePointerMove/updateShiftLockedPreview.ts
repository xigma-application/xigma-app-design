// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TPencilDragRefs } from '../../types';
import { TPoint } from 'types/canvas';

// utils
import { getAxisLockedPoint } from 'utils/math/axis/getAxisLockedPoint';
import { getDominantAxis } from 'utils/math/axis/getDominantAxis';
import { simplifyPencilPoints } from '../simplifyPencilPoints';

export const updateShiftLockedPreview = (
  refs: TCanvasRefs,
  pencilDragRefs: TPencilDragRefs,
  committed: TPoint[],
  tail: TPoint[],
  currentPoint: TPoint,
  zoom: number,
  tolerance: number,
): void => {
  const { axisLockRef, shiftAnchorRef } = pencilDragRefs;
  const anchor = shiftAnchorRef.current ?? tail[tail.length - 1];
  const axis = axisLockRef.current ?? getDominantAxis(anchor, currentPoint, zoom);

  shiftAnchorRef.current = anchor;
  axisLockRef.current = axis;

  const previewPoint = axis ? getAxisLockedPoint(anchor, currentPoint, axis) : currentPoint;
  const previewTail = simplifyPencilPoints([...tail, previewPoint], tolerance);

  refs.pencil.pencilPreviewPointsRef.current = [...committed, ...previewTail.slice(1)];
};
