// types
import { NodeType } from 'types/design/enums';
import { TDraftRect } from 'types/canvas';
import { TSceneNode } from 'types/design/types';
import { TSvgShapeNode } from './types';

// utils
import { drawSvgBoxShape } from './drawSvgBoxShape';
import { drawSvgEllipseShape } from './drawSvgEllipseShape';
import { drawSvgLineShape } from './drawSvgLineShape';
import { drawSvgMediaNodeShape } from './drawSvgMediaNodeShape';
import { drawSvgSimpleShape } from './drawSvgSimpleShape';
import { drawSvgVectorNodeShape } from './drawSvgVectorNodeShape';

export const drawSvgShape = async (
  elements: string[],
  defs: string[],
  node: TSvgShapeNode,
  nodesById: Record<string, TSceneNode>,
  bounds: TDraftRect,
): Promise<void> => {
  switch (node.type) {
    case NodeType.frame:
    case NodeType.rectangle:
      await drawSvgBoxShape(elements, defs, node, nodesById, bounds);
      break;
    case NodeType.ellipse:
      await drawSvgEllipseShape(elements, defs, node, nodesById, bounds);
      break;
    case NodeType.line:
      drawSvgLineShape(elements, node, nodesById, bounds);
      break;
    case NodeType.vector:
      await drawSvgVectorNodeShape(elements, defs, node, nodesById, bounds);
      break;
    case NodeType.media:
      await drawSvgMediaNodeShape(elements, node, nodesById, bounds);
      break;
    default:
      drawSvgSimpleShape(elements, node, nodesById, bounds);
  }
};
