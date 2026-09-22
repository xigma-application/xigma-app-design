// types
import { NodeType } from 'types/design/enums';
import { TDraftRect } from 'types/canvas';
import { TEllipseNode, TPolygonNode, TSceneNode, TStarNode } from 'types/design/types';

// utils
import { drawSvgEllipseShape } from './drawSvgEllipseShape';
import { drawSvgPolygonShape } from './drawSvgPolygonShape';
import { drawSvgStarShape } from './drawSvgStarShape';
import { getEffectiveOpacity } from 'components/Design/Canvas/hooks/useCanvasRenderLoop/utils/drawScene/getEffectiveOpacity';

export const drawSvgSimpleShape = (
  elements: string[],
  node: TEllipseNode | TPolygonNode | TStarNode,
  nodesById: Record<string, TSceneNode>,
  bounds: TDraftRect,
): void => {
  const opacity = getEffectiveOpacity(node, nodesById);

  switch (node.type) {
    case NodeType.ellipse:
      drawSvgEllipseShape(elements, node, opacity, bounds);
      break;
    case NodeType.polygon:
      drawSvgPolygonShape(elements, node, opacity, bounds);
      break;
    default:
      drawSvgStarShape(elements, node, opacity, bounds);
  }
};
