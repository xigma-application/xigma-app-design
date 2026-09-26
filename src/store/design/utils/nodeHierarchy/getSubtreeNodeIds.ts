// types
import { TSceneNode } from 'types/design/types';

// utils
import { getRigidTransformNodes } from './getRigidTransformNodes';

export const getSubtreeNodeIds = (ids: string[], nodesById: Record<string, TSceneNode>): string[] =>
  getRigidTransformNodes(
    ids.map((id) => nodesById[id]).filter((node): node is TSceneNode => Boolean(node)),
    nodesById,
  ).map((node) => node.id);
