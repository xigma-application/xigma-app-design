// types
import { TBooleanNode, TSceneNode } from 'types/design/types';
import { TDrawSceneContext } from './types';

// utils
import { drawVectorNode } from './drawVectorNodeOrTextPathGuide/drawSceneVectorNode/drawVectorNode';
import { getBooleanVectorNode } from 'utils/canvas/booleanOperation/getBooleanVectorNode';

export const drawBooleanLeafNode = (context: TDrawSceneContext, node: TBooleanNode, nodesById: Record<string, TSceneNode>): void => {
  const vector = getBooleanVectorNode(node, nodesById);

  if (vector) {
    drawVectorNode(context, vector);
  }
};
