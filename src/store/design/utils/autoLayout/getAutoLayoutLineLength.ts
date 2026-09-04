// types
import { TAutoLayoutChildSize } from './getAutoLayoutChildPositions';

export const getAutoLayoutLineLength = (isHorizontal: boolean, itemSpacing: number, line: TAutoLayoutChildSize[]): number =>
  line.reduce((total, child, index) => {
    const size = isHorizontal ? child.width : child.height;
    return total + size + (index > 0 ? itemSpacing : 0);
  }, 0);
