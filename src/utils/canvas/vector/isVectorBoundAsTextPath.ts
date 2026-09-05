// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

export const isVectorBoundAsTextPath = (nodes: Record<string, TSceneNode> | TSceneNode[], vectorId: string): boolean =>
  Object.values(nodes).some((node) => node.type === NodeType.text && node.pathId === vectorId);
