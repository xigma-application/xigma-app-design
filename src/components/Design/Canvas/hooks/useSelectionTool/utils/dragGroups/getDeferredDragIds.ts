// store
import { getRigidTransformNodes } from 'store/design/utils/nodeHierarchy/getRigidTransformNodes';

// types
import { TSceneNode } from 'types/design/types';

// utils
import { getDeferredDragNodes } from './getDeferredDragNodes';

export const getDeferredDragIds = (
  selectedNodes: TSceneNode[],
  grabbedGroup: TSceneNode[],
  nodesById: Record<string, TSceneNode>,
): Set<string> =>
  new Set(getRigidTransformNodes(getDeferredDragNodes(selectedNodes, grabbedGroup, nodesById), nodesById).map((node) => node.id));
