// others
import { INDICATOR_THICKNESS_PX } from '../constants';

// types
import { TAutoLayoutChildPosition, TAutoLayoutChildSize } from '../getAutoLayoutChildPositions';
import { TAxisAlign } from '../getAlignmentComponents';
import { TPoint } from 'types/canvas';

export const getAutoLayoutInsertedPosition = (
  isHorizontal: boolean,
  itemSpacing: number,
  primaryAlign: TAxisAlign,
  index: number,
  realPositions: TAutoLayoutChildPosition[],
  children: TAutoLayoutChildSize[],
  draggedSize: { height: number; width: number },
  simulatedPosition: TPoint,
): TPoint => {
  const isFirst = index === 0;
  const isLast = index === children.length;

  switch (true) {
    case isFirst && primaryAlign === 'start':
      return simulatedPosition;
    case isLast && primaryAlign === 'end': {
      const simulatedPrimary = isHorizontal ? simulatedPosition.x : simulatedPosition.y;
      const draggedPrimarySize = isHorizontal ? draggedSize.width : draggedSize.height;
      const primary = simulatedPrimary + draggedPrimarySize - INDICATOR_THICKNESS_PX;

      return isHorizontal ? { x: primary, y: simulatedPosition.y } : { x: simulatedPosition.x, y: primary };
    }
    case !isFirst: {
      const previousPosition = realPositions[index - 1];
      const previousSize = children[index - 1];
      const previousPrimaryStart = isHorizontal ? previousPosition.x : previousPosition.y;
      const previousPrimarySize = isHorizontal ? previousSize.width : previousSize.height;
      const primary = previousPrimaryStart + previousPrimarySize + itemSpacing / 2;

      return isHorizontal ? { x: primary, y: simulatedPosition.y } : { x: simulatedPosition.x, y: primary };
    }
    case children.length === 0:
      return simulatedPosition;
    default: {
      const nextPosition = realPositions[0];
      const nextPrimaryStart = isHorizontal ? nextPosition.x : nextPosition.y;
      const primary = nextPrimaryStart - itemSpacing / 2;

      return isHorizontal ? { x: primary, y: simulatedPosition.y } : { x: simulatedPosition.x, y: primary };
    }
  }
};
