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
  defs: string[],
  node: TFrameNode | TRectangleNode,
  nodesById: Record<string, TSceneNode>,
  bounds: TDraftRect,
): void => {
  const opacity = getEffectiveOpacity(node, nodesById);

  drawSvgPaintPolygons(elements, defs, node.fills, [getBoxFillPolygon(node)], opacity, bounds);

  if (node.strokes && hasVectorStroke(node)) {
    drawSvgPaintPolygons(elements, defs, node.strokes, getBoxStrokeRingPolygons(node), opacity, bounds);
  }
};
