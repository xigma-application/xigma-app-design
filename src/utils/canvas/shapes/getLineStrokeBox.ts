// others
import { LINE_RENDER_STROKE_WIDTH } from 'constant/canvas';

// types
import { TBoxPaintsBounds } from 'components/Design/Canvas/hooks/useCanvasRenderLoop/utils/drawScene/drawBoxLeafNode/types';
import { TLineNode } from 'types/design/types';

export const getLineStrokeBox = (line: TLineNode): TBoxPaintsBounds => {
  const strokeWidth = line.strokeWidth ?? LINE_RENDER_STROKE_WIDTH;

  return { height: strokeWidth, rotation: line.rotation, width: line.width, x: line.x, y: line.y - strokeWidth / 2 };
};
