// types
import { TDraftRect } from 'types/canvas';
import { TFrameNode, TRectangleNode, TSceneNode } from 'types/design/types';

// utils
import { drawSvgPaintPolygons } from './drawSvgPaintPolygons';
import { getBoxFillPolygon } from 'components/Design/Canvas/hooks/useCanvasRenderLoop/utils/drawScene/getBoxFillPolygon';
import { getBoxStrokeRingPolygons } from 'components/Design/Canvas/hooks/useCanvasRenderLoop/utils/drawScene/getBoxStrokeRingPolygons/getBoxStrokeRingPolygons';
import { getEffectiveOpacity } from 'components/Design/Canvas/hooks/useCanvasRenderLoop/utils/drawScene/getEffectiveOpacity';
import { hasVectorStroke } from '../hasVectorStroke';

export const drawSvgBoxShape = async (
  elements: string[],
  defs: string[],
  node: TFrameNode | TRectangleNode,
  nodesById: Record<string, TSceneNode>,
  bounds: TDraftRect,
): Promise<void> => {
  const opacity = getEffectiveOpacity(node, nodesById);
  const boxGeometry = { rect: { height: node.height, width: node.width, x: node.x, y: node.y }, rotation: node.rotation };

  await drawSvgPaintPolygons(elements, defs, node.fills, [getBoxFillPolygon(node)], opacity, bounds, null, boxGeometry);

  if (node.strokes && hasVectorStroke(node)) {
    await drawSvgPaintPolygons(elements, defs, node.strokes, getBoxStrokeRingPolygons(node), opacity, bounds);
  }
};
