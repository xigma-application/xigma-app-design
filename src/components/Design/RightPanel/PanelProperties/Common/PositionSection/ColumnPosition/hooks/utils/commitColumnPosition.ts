// store
import { AppDispatch, store } from 'store';
import { selectNodes } from 'store/design/selectors';
import { updateNode } from 'store/design/slice';

// utils
import { getNodeAbsoluteFromParentPosition } from 'store/design/utils/getNodeAbsoluteFromParentPosition';
import { isAppearanceNode } from 'components/Design/RightPanel/PanelProperties/Common/AppearanceSection/types';
import { translateFillsCrop } from 'components/Design/Canvas/utils/translateFillsCrop';

type TParent = Parameters<typeof getNodeAbsoluteFromParentPosition>[1];

export const commitColumnPosition = (
  dispatch: AppDispatch,
  id: string,
  parent: TParent | undefined,
  nextX: number,
  nextY: number,
): void => {
  const absolute = parent ? getNodeAbsoluteFromParentPosition({ x: nextX, y: nextY }, parent) : { x: nextX, y: nextY };
  const x = parent ? Math.round(absolute.x) : absolute.x;
  const y = parent ? Math.round(absolute.y) : absolute.y;
  const node = selectNodes(store.getState())[id];
  const fills = node && isAppearanceNode(node) ? translateFillsCrop(node.fills, x - node.x, y - node.y) : undefined;

  dispatch(updateNode({ changes: fills ? { fills, x, y } : { x, y }, id }));
};
