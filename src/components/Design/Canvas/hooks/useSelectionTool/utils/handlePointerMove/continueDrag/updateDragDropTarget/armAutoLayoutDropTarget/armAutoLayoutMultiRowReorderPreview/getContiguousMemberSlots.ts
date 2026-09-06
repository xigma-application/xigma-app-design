// types
import { TAutoLayoutChildSize } from 'store/design/utils/autoLayout/getAutoLayoutChildPositions';
import { TPoint } from 'types/canvas';

export const getContiguousMemberSlots = (isHorizontal: boolean, sizes: TAutoLayoutChildSize[], itemSpacing: number): TPoint[] => {
  let primary = 0;

  return sizes.map((size) => {
    const point = isHorizontal ? { x: primary, y: 0 } : { x: 0, y: primary };
    primary += (isHorizontal ? size.width : size.height) + itemSpacing;

    return point;
  });
};
