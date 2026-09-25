// others
import { LINE_RENDER_STROKE_WIDTH } from 'constant/canvas';

// types
import { TLineFrame } from '../types';
import { TLineNode } from 'types/design/types';

// utils
import { getLinePoints } from '../getLinePoints';

export const getLineFrame = (line: TLineNode): TLineFrame => {
  const { x1, x2, y1, y2 } = getLinePoints(line);
  const length = Math.hypot(x2 - x1, y2 - y1);
  const unit = length > 0 ? { x: (x2 - x1) / length, y: (y2 - y1) / length } : { x: 1, y: 0 };

  return {
    end: { x: x2, y: y2 },
    halfWidth: (line.strokeWidth ?? LINE_RENDER_STROKE_WIDTH) / 2,
    length,
    normal: { x: unit.y, y: -unit.x },
    start: { x: x1, y: y1 },
    unit,
  };
};
