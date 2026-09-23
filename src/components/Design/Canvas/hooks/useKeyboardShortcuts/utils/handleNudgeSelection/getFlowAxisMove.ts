// types
import { LayoutMode } from 'types/design/enums';

export type TFlowAxisMove = { direction: 1 | -1; kind: 'cross' | 'primary' };

export const getFlowAxisMove = (
  layoutMode: LayoutMode.horizontal | LayoutMode.vertical,
  deltaX: number,
  deltaY: number,
): TFlowAxisMove | null => {
  const isHorizontal = layoutMode === LayoutMode.horizontal;

  switch (true) {
    case isHorizontal && deltaX !== 0:
      return { direction: deltaX > 0 ? 1 : -1, kind: 'primary' };
    case isHorizontal && deltaY !== 0:
      return { direction: deltaY > 0 ? 1 : -1, kind: 'cross' };
    case !isHorizontal && deltaY !== 0:
      return { direction: deltaY > 0 ? 1 : -1, kind: 'primary' };
    case !isHorizontal && deltaX !== 0:
      return { direction: deltaX > 0 ? 1 : -1, kind: 'cross' };
    default:
      return null;
  }
};
