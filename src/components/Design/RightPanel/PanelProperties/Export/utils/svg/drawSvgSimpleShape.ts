// types
import { NodeType } from 'types/design/enums';
import { TDraftRect } from 'types/canvas';
import { TPolygonNode, TSceneNode, TStarNode } from 'types/design/types';

// utils
import { drawSvgPolygonShape } from './drawSvgPolygonShape';
import { drawSvgStarShape } from './drawSvgStarShape';
import { getEffectiveOpacity } from 'components/Design/Canvas/hooks/useCanvasRenderLoop/utils/drawScene/getEffectiveOpacity';

export const drawSvgSimpleShape = (
  elements: string[],
  node: TPolygonNode | TStarNode,
  nodesById: Record<string, TSceneNode>,
  bounds: TDraftRect,
): void => {
  const opacity = getEffectiveOpacity(node, nodesById);

  switch (node.type) {
    case NodeType.polygon:
      drawSvgPolygonShape(elements, node, opacity, bounds);
      break;
    default:
      drawSvgStarShape(elements, node, opacity, bounds);
  }
};
