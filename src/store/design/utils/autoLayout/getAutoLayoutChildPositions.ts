// types
import { LayoutMode } from 'types/design/enums';
import { TPoint } from 'types/canvas';

export type TAutoLayoutChildSize = { height: number; id: string; width: number };

export type TAutoLayoutChildPosition = { id: string; x: number; y: number };

export const getAutoLayoutChildPositions = (
  layoutMode: LayoutMode.horizontal | LayoutMode.vertical,
  itemSpacing: number,
  origin: TPoint,
  children: TAutoLayoutChildSize[],
): TAutoLayoutChildPosition[] => {
  const isHorizontal = layoutMode === LayoutMode.horizontal;
  let offset = 0;

  return children.map((child) => {
    const position = { id: child.id, x: origin.x + (isHorizontal ? offset : 0), y: origin.y + (isHorizontal ? 0 : offset) };
    offset += (isHorizontal ? child.width : child.height) + itemSpacing;

    return position;
  });
};
