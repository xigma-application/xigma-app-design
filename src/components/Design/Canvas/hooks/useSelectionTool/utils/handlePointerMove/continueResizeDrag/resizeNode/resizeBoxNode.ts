// store
import { selectNodes } from 'store/design/selectors';
import { getAutoLayoutSizingModeResetChanges } from 'store/design/utils/autoLayout/getAutoLayoutSizingModeResetChanges';
import { updateNode } from 'store/design/slice';
import { AppDispatch, store } from 'store';

// types
import { TPoint } from 'types/canvas';
import { TResizeNodeOrigin, TVectorNodeOrigin } from 'types/design/selectionTool/types';

// utils
import { clampAutoLayoutSize } from 'store/design/utils/autoLayout/clampAutoLayoutSize';
import { getResizeAxisScale } from './getResizeAxisScale';
import { getResizeChanges } from './getResizeChanges';
import { getResizedPosition } from './getResizedPosition';
import { isBoxSceneNode } from 'components/Design/Canvas/utils/isBoxSceneNode';

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
  const node = selectNodes(store.getState())[id];
  const rawHeight = Math.round(origin.height * axisScale.y);
  const rawWidth = Math.round(origin.width * axisScale.x);
  const height = node && isBoxSceneNode(node) ? clampAutoLayoutSize(rawHeight, node.minHeight, node.maxHeight) : rawHeight;
  const width = node && isBoxSceneNode(node) ? clampAutoLayoutSize(rawWidth, node.minWidth, node.maxWidth) : rawWidth;
  const { x, y } = getResizedPosition(origin, anchors, scaleX, scaleY, width, height, rotatedAnchorSolver);
  const changes = getResizeChanges(origin, scaleX, scaleY, isSingleBoxOrigin, height, width, x, y);
  const sizingModeChanges = node ? getAutoLayoutSizingModeResetChanges(node, width !== origin.width, height !== origin.height) : {};

  dispatch(updateNode({ changes: { ...changes, ...sizingModeChanges }, id }));
};
