// types
import { NodeType } from 'types/design/enums';
import { TMaskRenderer } from './types';
import { TSceneNode } from 'types/design/types';

const MEASURABLE_TYPES = new Set<NodeType>([
  NodeType.ellipse,
  NodeType.frame,
  NodeType.group,
  NodeType.polygon,
  NodeType.rectangle,
  NodeType.star,
]);

export const getIsolatedSubtree = (renderer: TMaskRenderer, node: TSceneNode): TSceneNode[] | null => {
  const subtree: TSceneNode[] = [];
  const pendingIds = 'childIds' in node ? [...node.childIds] : [];
  let isMeasurable = true;

  while (pendingIds.length > 0) {
    const child = renderer.sceneNodeById.get(pendingIds.pop() as string);

    if (child && MEASURABLE_TYPES.has(child.type)) {
      subtree.push(child);
      pendingIds.push(...('childIds' in child ? child.childIds : []));
    } else if (child) {
      isMeasurable = false;
    }
  }

  return isMeasurable ? subtree : null;
};
