// store
import { AppDispatch, store } from 'store';
import { selectNodes } from 'store/design/selectors';
import { updateNode } from 'store/design/slice';

// types
import { NodeType } from 'types/design/enums';

// utils
import { getCropPaintChanges } from 'components/Design/Canvas/utils/getCropPaintChanges';
import { getNodeBounds } from 'components/Design/Canvas/utils/getNodeBounds';
import { getNodeAbsoluteFromParentPosition } from 'store/design/utils/getNodeAbsoluteFromParentPosition';
import { isAppearanceNode } from 'components/Design/RightPanel/PanelProperties/Common/AppearanceSection/types';
import { isGroupLikeNode } from 'store/design/utils/nodeHierarchy/isGroupLikeNode';
import { translateFillsCrop } from 'components/Design/Canvas/utils/translateFillsCrop';
import { translateNodeSubtree } from '../../../ColumnAlignment/hooks/utils/translateNodeSubtree';

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
  const nodes = selectNodes(store.getState());
  const node = nodes[id];

  if (node && (isGroupLikeNode(node) || node.type === NodeType.vector)) {
    const bounds = getNodeBounds(node);
    translateNodeSubtree(dispatch, nodes, node, x - bounds.x, y - bounds.y);
  } else {
    const cropChanges =
      node && isAppearanceNode(node) ? getCropPaintChanges(node, (paints) => translateFillsCrop(paints, x - node.x, y - node.y)) : {};

    dispatch(updateNode({ changes: { ...cropChanges, x, y }, id }));
  }
};
