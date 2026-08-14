// store
import { AppDispatch } from 'store';

// types
import { TPoint } from 'types/canvas';
import { TResizeNodeOrigin } from '../../../../types';

// utils
import { resizeBoxNode } from './resizeBoxNode';
import { resizeLineNode } from './resizeLineNode';

export const resizeNode = (
  id: string,
  origin: TResizeNodeOrigin,
  dispatch: AppDispatch,
  anchors: { x: number | null; y: number | null },
  scaleX: number,
  scaleY: number,
  isSingleBoxOrigin: boolean,
  rotatedAnchorSolver: ((width: number, height: number) => TPoint) | null,
): void => {
  if ('x1' in origin) {
    resizeLineNode(id, origin, dispatch, anchors, scaleX, scaleY);
  } else {
    resizeBoxNode(id, origin, dispatch, anchors, scaleX, scaleY, isSingleBoxOrigin, rotatedAnchorSolver);
  }
};
