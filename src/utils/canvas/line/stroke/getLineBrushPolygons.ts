// types
import { TLineFrame } from '../types';
import { TLineNode } from 'types/design/types';
import { TPoint } from 'types/canvas';

// utils
import { buildOpenStrokeRing } from 'components/Design/Canvas/hooks/useCanvasRenderLoop/utils/drawScene/buildOpenStrokeRing';
import { getBoxBrushStrokePolygons } from 'components/Design/Canvas/hooks/useCanvasRenderLoop/utils/drawScene/getBoxBrushStrokePolygons';

export const getLineBrushPolygons = (line: TLineNode, frame: TLineFrame): TPoint[][] | null =>
  getBoxBrushStrokePolygons(line, buildOpenStrokeRing(frame.start, frame.end, frame.halfWidth));
