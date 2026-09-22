// types
import { TDraftRect } from 'types/canvas';
import { TFrameNode, TRectangleNode, TSceneNode } from 'types/design/types';

// utils
import { drawSvgPaintPolygons } from './drawSvgPaintPolygons';
import { getBoxFillPolygon } from 'components/Design/Canvas/hooks/useCanvasRenderLoop/utils/drawScene/getBoxFillPolygon';
import { getBoxStrokeRingPolygons } from 'components/Design/Canvas/hooks/useCanvasRenderLoop/utils/drawScene/getBoxStrokeRingPolygons/getBoxStrokeRingPolygons';
import { getEffectiveOpacity } from 'components/Design/Canvas/hooks/useCanvasRenderLoop/utils/drawScene/getEffectiveOpacity';
import { hasVectorStroke } from '../hasVectorStroke';

export const drawSvgBoxShape = (
  elements: string[],
  node: TFrameNode | TRectangleNode,
  nodesById: Record<string, TSceneNode>,
  bounds: TDraftRect,
): void => {
  const opacity = getEffectiveOpacity(node, nodesById);

  drawSvgPaintPolygons(elements, node.fills, [getBoxFillPolygon(node)], opacity, bounds);

  if (node.strokes && hasVectorStroke(node)) {
    drawSvgPaintPolygons(elements, node.strokes, getBoxStrokeRingPolygons(node), opacity, bounds);
  }
};
