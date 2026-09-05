// others
import { INDICATOR_THICKNESS_PX } from './constants';

// types
import { TAutoLayoutChildSize } from './getAutoLayoutChildPositions';
import { TAxisAlign } from './getAlignmentComponents';
import { TPoint } from 'types/canvas';

export type TAutoLayoutPrimaryNeighbor = { position: TPoint; size: TAutoLayoutChildSize } | null;

export const getAutoLayoutPrimaryAnchoredPosition = (
  isHorizontal: boolean,
  itemSpacing: number,
  primaryAlign: TAxisAlign,
  previous: TAutoLayoutPrimaryNeighbor,
  next: TAutoLayoutPrimaryNeighbor,
  draggedSize: { height: number; width: number },
  simulatedPosition: TPoint,
): TPoint => {
  switch (true) {
    case previous === null && primaryAlign === 'start':
      return simulatedPosition;
    case next === null && primaryAlign === 'end': {
      const simulatedPrimary = isHorizontal ? simulatedPosition.x : simulatedPosition.y;
      const draggedPrimarySize = isHorizontal ? draggedSize.width : draggedSize.height;
      const primary = simulatedPrimary + draggedPrimarySize - INDICATOR_THICKNESS_PX;

      return isHorizontal ? { x: primary, y: simulatedPosition.y } : { x: simulatedPosition.x, y: primary };
    }
    case previous !== null: {
      const previousPrimaryStart = isHorizontal ? previous.position.x : previous.position.y;
      const previousPrimarySize = isHorizontal ? previous.size.width : previous.size.height;
      const primary = previousPrimaryStart + previousPrimarySize + itemSpacing / 2;

      return isHorizontal ? { x: primary, y: simulatedPosition.y } : { x: simulatedPosition.x, y: primary };
    }
    case next !== null: {
      const nextPrimaryStart = isHorizontal ? next.position.x : next.position.y;
      const primary = nextPrimaryStart - itemSpacing / 2;

      return isHorizontal ? { x: primary, y: simulatedPosition.y } : { x: simulatedPosition.x, y: primary };
    }
    default:
      return simulatedPosition;
  }
};
