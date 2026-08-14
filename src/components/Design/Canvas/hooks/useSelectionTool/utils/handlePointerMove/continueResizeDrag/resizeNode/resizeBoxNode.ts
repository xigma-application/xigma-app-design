// store
import { updateNode } from 'store/design/slice';
import { AppDispatch } from 'store';

// types
import { TPoint } from 'types/canvas';
import { TResizeNodeOrigin } from '../../../../types';

// utils
import { getResizeAxisScale } from './getResizeAxisScale';
import { getResizeChanges } from './getResizeChanges';
import { getResizedPosition } from './getResizedPosition';

export const resizeBoxNode = (
  id: string,
  origin: Exclude<TResizeNodeOrigin, { x1: number; x2: number; y1: number; y2: number }>,
  dispatch: AppDispatch,
  anchors: { x: number | null; y: number | null },
  scaleX: number,
  scaleY: number,
  isSingleBoxOrigin: boolean,
  rotatedAnchorSolver: ((width: number, height: number) => TPoint) | null,
): void => {
  const axisScale = getResizeAxisScale(scaleX, scaleY, origin.rotation, isSingleBoxOrigin);
  const height = origin.height * axisScale.y;
  const width = origin.width * axisScale.x;
  const { x, y } = getResizedPosition(origin, anchors, scaleX, scaleY, width, height, rotatedAnchorSolver);
  const changes = getResizeChanges(origin, scaleX, scaleY, isSingleBoxOrigin, height, width, x, y);

  dispatch(updateNode({ changes, id }));
};
