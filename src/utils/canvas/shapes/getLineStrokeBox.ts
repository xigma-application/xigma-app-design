// others
import { LINE_RENDER_STROKE_WIDTH } from 'constant/canvas';

// types
import { TBoxPaintsBounds } from 'components/Design/Canvas/hooks/useCanvasRenderLoop/utils/drawScene/drawBoxLeafNode/types';
import { TDraftLine } from 'types/design/types';

export const getLineStrokeBox = (line: TDraftLine): TBoxPaintsBounds => {
  const length = Math.hypot(line.x2 - line.x1, line.y2 - line.y1);
  const width = line.strokeWidth ?? LINE_RENDER_STROKE_WIDTH;

  return {
    height: width,
    rotation: (Math.atan2(line.y2 - line.y1, line.x2 - line.x1) * 180) / Math.PI,
    width: length,
    x: (line.x1 + line.x2) / 2 - length / 2,
    y: (line.y1 + line.y2) / 2 - width / 2,
  };
};
