// types
import { TFrameNode, TSceneNode } from 'types/design/types';
import { TGridCellPlacement } from 'store/design/utils/autoLayout/computeGridLayoutPositions/types';
import { TGridDropCell } from '../getGridDropCell';

export type TGridDropHover = {
  cells: TGridDropCell[];
  indicator?: { column: number; row: number; side: 'left' | 'right' };
  insertIndex?: number;
};

export type TGridDropContext = {
  count: number;
  frame: TFrameNode;
  movedNodeIds: string[];
  nodesById: Record<string, TSceneNode>;
};

export type TGridOccupancyIndex = {
  cellOwner: Map<string, TGridCellPlacement>;
  occupied: Set<string>;
};
