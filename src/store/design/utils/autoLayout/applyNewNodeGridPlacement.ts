// types
import { SizingMode } from 'types/design/enums';
import { TDesignState } from '../../types';
import { TFrameNode, TSceneNode } from 'types/design/types';
import { TGridDropCell } from 'utils/canvas/gridSlots/getGridDropCell';
import { TGridShiftedPlacement } from 'utils/canvas/gridSlots/getGridInsertPlacements/types';

// utils
import { getActivePage } from '../getActivePage';
import { getGridInsertPlacements } from 'utils/canvas/gridSlots/getGridInsertPlacements/getGridInsertPlacements';
import { isBoxSceneNode } from 'components/Design/Canvas/utils/isBoxSceneNode';

const anchorShiftedGridSiblings = (nodes: Record<string, TSceneNode>, shifted: TGridShiftedPlacement[]): void => {
  shifted.forEach(({ cell, id }) => {
    const siblingNode = nodes[id];

    if (siblingNode && isBoxSceneNode(siblingNode)) {
      siblingNode.gridColumnAnchorIndex = cell.column;
      siblingNode.gridRowAnchorIndex = cell.row;
    }
  });
};

const anchorNewGridNode = (newNode: TSceneNode | undefined, placement: TGridDropCell | undefined): void => {
  if (newNode && isBoxSceneNode(newNode) && placement) {
    newNode.gridColumnAnchorIndex = placement.column;
    newNode.gridRowAnchorIndex = placement.row;
    newNode.heightSizingMode = SizingMode.fill;
    newNode.widthSizingMode = SizingMode.fill;
  }
};

export const applyNewNodeGridPlacement = (state: TDesignState, frame: TFrameNode, nodeId: string, insertIndex: number): void => {
  const { nodes } = getActivePage(state);
  const { dragged, shifted } = getGridInsertPlacements(frame, nodes, [nodeId], insertIndex);

  frame.gridAutoPlacement = false;

  anchorShiftedGridSiblings(nodes, shifted);
  anchorNewGridNode(nodes[nodeId], dragged[0]);
};
