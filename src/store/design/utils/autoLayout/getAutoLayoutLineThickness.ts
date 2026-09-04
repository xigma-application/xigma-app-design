// types
import { TAutoLayoutChildSize } from './getAutoLayoutChildPositions';

export const getAutoLayoutLineThickness = (isHorizontal: boolean, line: TAutoLayoutChildSize[]): number =>
  line.reduce((max, child) => Math.max(max, isHorizontal ? child.height : child.width), 0);
