// types
import { NodeType } from 'types/design/enums';
import { TPoint } from 'types/canvas';
import { TSceneNode } from 'types/design/types';

// utils
import { bakeVectorNodeRotation } from './bakeVectorNodeRotation';

export const getAllVectorVertexPositions = (nodes: Record<string, TSceneNode>, excludeVertexIds: string[] = []): TPoint[] =>
  Object.values(nodes)
    .filter((node): node is Extract<TSceneNode, { type: NodeType.vector }> => node.type === NodeType.vector)
    .flatMap((node) => Object.values(bakeVectorNodeRotation(node).vertices))
    .filter((vertex) => !excludeVertexIds.includes(vertex.id))
    .map((vertex) => ({ x: vertex.x, y: vertex.y }));
