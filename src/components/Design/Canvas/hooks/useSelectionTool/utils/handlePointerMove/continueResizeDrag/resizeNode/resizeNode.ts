// store
import { AppDispatch } from 'store';

// types
import { TPoint } from 'types/canvas';
import { TResizeNodeOrigin } from 'types/design/selectionTool/types';

// utils
import { resizeBoxNode } from './resizeBoxNode';
import { resizeLineNode } from './resizeLineNode';
import { resizeVectorNode } from './resizeVectorNode/resizeVectorNode';

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
  switch (true) {
    case 'x1' in origin:
      resizeLineNode(id, origin, dispatch, anchors, scaleX, scaleY);
      break;
    case 'vertices' in origin:
      resizeVectorNode(id, origin, dispatch, anchors, scaleX, scaleY, rotatedAnchorSolver);
      break;
    default:
      resizeBoxNode(id, origin, dispatch, anchors, scaleX, scaleY, isSingleBoxOrigin, rotatedAnchorSolver);
  }
};
