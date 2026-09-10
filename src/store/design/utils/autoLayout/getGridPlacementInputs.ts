// types
import { TSceneNode } from 'types/design/types';
import { TGridPlacementInput } from './computeGridLayoutPositions/types';

// utils
import { isBoxSceneNode } from 'components/Design/Canvas/utils/isBoxSceneNode';

export const getGridPlacementInputs = (
  childIds: string[],
  nodesById: Record<string, TSceneNode>,
  excludeIds: Set<string> = new Set(),
): TGridPlacementInput[] =>
  childIds
    .map((id) => nodesById[id])
    .filter((node): node is TSceneNode => Boolean(node) && !excludeIds.has(node.id))
    .map((node) => ({
      gridColumnAnchorIndex: isBoxSceneNode(node) ? node.gridColumnAnchorIndex : undefined,
      gridColumnSpan: isBoxSceneNode(node) ? node.gridColumnSpan : undefined,
      gridRowAnchorIndex: isBoxSceneNode(node) ? node.gridRowAnchorIndex : undefined,
      gridRowSpan: isBoxSceneNode(node) ? node.gridRowSpan : undefined,
      id: node.id,
    }));
