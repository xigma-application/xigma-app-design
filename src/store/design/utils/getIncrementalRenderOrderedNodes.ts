// types
import { TSceneNode } from 'types/design/types';

// utils
import { getChangedNodes, TChangedNodes } from './getChangedNodes';
import { getRenderOrderedNodes } from './getRenderOrderedNodes';
import { isContainerNode } from './nodeHierarchy/isContainerNode';

type TNodesById = Record<string, TSceneNode>;

let memo: { indexById: Map<string, number> | null; nodes: TNodesById; result: TSceneNode[]; rootOrder: string[] } | null = null;

const buildIndex = (result: TSceneNode[]): Map<string, number> => new Map(result.map((node, index) => [node.id, index]));

const replaceChanged = (
  previous: NonNullable<typeof memo>,
  rootOrder: string[],
  nodes: TNodesById,
  changed: TChangedNodes,
): TSceneNode[] => {
  const indexById = previous.indexById ?? buildIndex(previous.result);
  const result = previous.result.slice();

  changed.ids.forEach((id) => {
    const index = indexById.get(id);

    if (index !== undefined) {
      result[index] = nodes[id];
    }
  });

  memo = { indexById, nodes, result, rootOrder };

  return result;
};

const patchResult = (previous: NonNullable<typeof memo>, rootOrder: string[], nodes: TNodesById): TSceneNode[] | null => {
  if (previous.rootOrder === rootOrder) {
    const changed = getChangedNodes(previous.nodes, nodes);

    switch (true) {
      case changed.all:
      case changed.added > 0:
      case changed.removed > 0:
      case changed.nodes.some(isContainerNode):
        return null;
      default:
        return replaceChanged(previous, rootOrder, nodes, changed);
    }
  }

  return null;
};

export const getIncrementalRenderOrderedNodes = (rootOrder: string[], nodes: TNodesById): TSceneNode[] => {
  if (memo?.nodes !== nodes || memo.rootOrder !== rootOrder) {
    const patched = memo ? patchResult(memo, rootOrder, nodes) : null;
    const result = patched ?? getRenderOrderedNodes(rootOrder, nodes);

    if (!patched) {
      memo = { indexById: null, nodes, result, rootOrder };
    }

    return result;
  }

  return memo.result;
};
