// types
import { NodeType } from 'types/design/enums';
import { TDraftRect } from 'types/canvas';
import { TSceneNode } from 'types/design/types';
import { TSvgShapeNode } from './types';

// utils
import { drawSvgBoxShape } from './drawSvgBoxShape';
import { drawSvgLineShape } from './drawSvgLineShape';
import { drawSvgSimpleShape } from './drawSvgSimpleShape';

export const drawSvgShape = (
  elements: string[],
  defs: string[],
  node: TSvgShapeNode,
  nodesById: Record<string, TSceneNode>,
  bounds: TDraftRect,
): void => {
  switch (node.type) {
    case NodeType.frame:
    case NodeType.rectangle:
      drawSvgBoxShape(elements, defs, node, nodesById, bounds);
      break;
    case NodeType.line:
      drawSvgLineShape(elements, node, nodesById, bounds);
      break;
    default:
      drawSvgSimpleShape(elements, node, nodesById, bounds);
  }
};
