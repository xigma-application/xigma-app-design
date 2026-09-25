// types
import { TDraftRect } from 'types/canvas';
import { TLineNode, TSceneNode } from 'types/design/types';

// utils
import { drawSvgPolygons } from './drawSvgPolygons';
import { getEffectiveOpacity } from 'components/Design/Canvas/hooks/useCanvasRenderLoop/utils/drawScene/getEffectiveOpacity';
import { getLineStrokePolygon } from 'utils/canvas/shapes/getLineStrokePolygon';
import { getLineVectorStroke } from '../getLineVectorStroke';

export const drawSvgLineShape = (elements: string[], node: TLineNode, nodesById: Record<string, TSceneNode>, bounds: TDraftRect): void => {
  const polygon = getLineStrokePolygon(node);
  const stroke = getLineVectorStroke(node);

  if (polygon) {
    if (stroke) {
      drawSvgPolygons(elements, [polygon], stroke.color, (getEffectiveOpacity(node, nodesById) * stroke.opacity) / 100, bounds);
    }
  }
};
