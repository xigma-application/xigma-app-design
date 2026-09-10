// types
import { TFrameNode, TSceneNode } from 'types/design/types';
import { TGridPlacementInput } from './computeGridLayoutPositions/types';

// utils
import { isBoxSceneNode } from 'components/Design/Canvas/utils/isBoxSceneNode';
import { placeGridCells } from './computeGridLayoutPositions/placeGridCells/placeGridCells';

export const getDerivedGridRowCount = (frame: TFrameNode, nodesById: Record<string, TSceneNode>): number => {
  const columnCount = Math.max(Math.round(frame.gridColumnCount ?? 1), 1);
  const inputs: TGridPlacementInput[] = frame.childIds
    .map((id) => nodesById[id])
    .filter((node): node is TSceneNode => Boolean(node))
    .map((node) => ({
      gridColumnAnchorIndex: isBoxSceneNode(node) ? node.gridColumnAnchorIndex : undefined,
      gridColumnSpan: isBoxSceneNode(node) ? node.gridColumnSpan : undefined,
      gridRowAnchorIndex: isBoxSceneNode(node) ? node.gridRowAnchorIndex : undefined,
      gridRowSpan: isBoxSceneNode(node) ? node.gridRowSpan : undefined,
      id: node.id,
    }));
  const placements = placeGridCells(inputs, columnCount, frame.gridAutoPlacement ?? true);

  return placements.reduce((max, placement) => Math.max(max, placement.rowStart + placement.rowSpan), 1);
};
