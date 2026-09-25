// types
import { TLineBox, TLinePoints } from './types';

export const getLineBoxFromPoints = ({ x1, x2, y1, y2 }: TLinePoints): TLineBox => {
  const width = Math.hypot(x2 - x1, y2 - y1);

  return {
    height: 0,
    rotation: width === 0 ? 0 : (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI,
    width,
    x: (x1 + x2) / 2 - width / 2,
    y: (y1 + y2) / 2,
  };
};
