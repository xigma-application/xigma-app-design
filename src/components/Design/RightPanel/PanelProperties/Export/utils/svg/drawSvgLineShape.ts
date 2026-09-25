// others
import { LINE_RENDER_STROKE_WIDTH } from 'constant/canvas';

// types
import { TDraftRect } from 'types/canvas';
import { TLineNode, TSceneNode } from 'types/design/types';

// utils
import { drawSvgPolygons } from './drawSvgPolygons';
import { getEffectiveOpacity } from 'components/Design/Canvas/hooks/useCanvasRenderLoop/utils/drawScene/getEffectiveOpacity';
import { getLineArrowheadPolygons } from 'utils/canvas/shapes/getLineArrowheadPolygons';
import { getLineQuadPoints } from 'utils/canvas/shapes/getLineQuadPoints';

export const drawSvgLineShape = (elements: string[], node: TLineNode, nodesById: Record<string, TSceneNode>, bounds: TDraftRect): void => {
  const strokeWidth = node.strokeWidth ?? LINE_RENDER_STROKE_WIDTH;
  const polygons = [getLineQuadPoints(node, strokeWidth), ...getLineArrowheadPolygons(node)];

  drawSvgPolygons(elements, polygons, node.stroke, getEffectiveOpacity(node, nodesById), bounds);
};
