// types
import { TFrameNode, TSceneNode } from 'types/design/types';
import { TGridDropTargetHover } from 'types/design/canvas/types';
import { TSlotDelta } from './types';

// utils
import { getGridPlacementsById } from './getGridPlacementsById';

export const getGridSlotDelta = (
  frame: TFrameNode,
  orderedIds: string[],
  grabbedId: string,
  hover: TGridDropTargetHover | null,
  nodesById: Record<string, TSceneNode>,
): TSlotDelta => {
  const { columnCount, placements } = getGridPlacementsById(frame, nodesById);
  const origin = placements.get(grabbedId);
  const target =
    hover?.insertIndex !== undefined && hover.indicator
      ? { column: hover.insertIndex % columnCount, row: Math.floor(hover.insertIndex / columnCount) }
      : hover?.cells[orderedIds.indexOf(grabbedId)];

  return origin && target
    ? { steps: null, x: target.column - origin.columnStart, y: target.row - origin.rowStart }
    : { steps: null, x: 0, y: 0 };
};
