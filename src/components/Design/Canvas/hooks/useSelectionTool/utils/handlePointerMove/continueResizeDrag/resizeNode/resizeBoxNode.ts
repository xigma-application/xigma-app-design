// store
import { selectNodes } from 'store/design/selectors';
import { getAutoLayoutSizingModeResetChanges } from 'store/design/utils/autoLayout/getAutoLayoutSizingModeResetChanges';
import { updateNode } from 'store/design/slice';
import { AppDispatch, store } from 'store';

// types
import { TPoint } from 'types/canvas';
import { TResizeNodeOrigin, TVectorNodeOrigin } from 'types/design/selectionTool/types';

// utils
import { getResizeAxisScale } from './getResizeAxisScale';
import { getResizeChanges } from './getResizeChanges';
import { getResizedPosition } from './getResizedPosition';

export const resizeBoxNode = (
  id: string,
  origin: Exclude<TResizeNodeOrigin, { x1: number; x2: number; y1: number; y2: number } | TVectorNodeOrigin>,
  dispatch: AppDispatch,
  anchors: { x: number | null; y: number | null },
  scaleX: number,
  scaleY: number,
  isSingleBoxOrigin: boolean,
  rotatedAnchorSolver: ((width: number, height: number) => TPoint) | null,
): void => {
  const axisScale = getResizeAxisScale(scaleX, scaleY, origin.rotation, isSingleBoxOrigin);
  const height = Math.round(origin.height * axisScale.y);
  const width = Math.round(origin.width * axisScale.x);
  const { x, y } = getResizedPosition(origin, anchors, scaleX, scaleY, width, height, rotatedAnchorSolver);
  const changes = getResizeChanges(origin, scaleX, scaleY, isSingleBoxOrigin, height, width, x, y);
  const node = selectNodes(store.getState())[id];
  const sizingModeChanges = node ? getAutoLayoutSizingModeResetChanges(node, width !== origin.width, height !== origin.height) : {};

  dispatch(updateNode({ changes: { ...changes, ...sizingModeChanges }, id }));
};
