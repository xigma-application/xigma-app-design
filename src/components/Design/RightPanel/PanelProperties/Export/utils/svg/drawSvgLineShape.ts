// types
import { TDraftRect } from 'types/canvas';
import { TLineNode, TSceneNode } from 'types/design/types';

// utils
import { drawSvgPolygons } from './drawSvgPolygons';
import { getEffectiveOpacity } from 'components/Design/Canvas/hooks/useCanvasRenderLoop/utils/drawScene/getEffectiveOpacity';
import { getLineStrokeShape } from 'utils/canvas/line/stroke/getLineStrokeShape';
import { getLineVectorStroke } from '../getLineVectorStroke';

export const drawSvgLineShape = (elements: string[], node: TLineNode, nodesById: Record<string, TSceneNode>, bounds: TDraftRect): void => {
  const shape = getLineStrokeShape(node);
  const stroke = getLineVectorStroke(node);

  if (shape) {
    if (stroke) {
      drawSvgPolygons(
        elements,
        shape.polygons,
        stroke.color,
        (getEffectiveOpacity(node, nodesById) * stroke.opacity) / 100,
        bounds,
        shape.fillRule === 'nonZero' ? 'nonzero' : 'evenodd',
      );
    }
  }
};
