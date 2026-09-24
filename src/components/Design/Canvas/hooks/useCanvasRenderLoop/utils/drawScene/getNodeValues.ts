// types
import { TSceneNode } from 'types/design/types';

// utils
import { getChangedNodes, TChangedNodes } from 'store/design/utils/getChangedNodes';

type TNodesById = Record<string, TSceneNode>;

const valuesByNodes = new WeakMap<TNodesById, TSceneNode[]>();

let memo: { indexById: Map<string, number> | null; nodes: TNodesById; values: TSceneNode[] } | null = null;

const buildIndex = (values: TSceneNode[]): Map<string, number> => new Map(values.map((node, index) => [node.id, index]));

const writeChangedValues = (values: TSceneNode[], indexById: Map<string, number>, nodesById: TNodesById, ids: Set<string>): void => {
  ids.forEach((id) => {
    values[indexById.get(id) as number] = nodesById[id];
  });
};

const replaceChanged = (previous: NonNullable<typeof memo>, nodesById: TNodesById, changed: TChangedNodes): TSceneNode[] | null => {
  const indexById = previous.indexById ?? buildIndex(previous.values);

  if ([...changed.ids].every((id) => indexById.has(id))) {
    const values = previous.values.slice();

    writeChangedValues(values, indexById, nodesById, changed.ids);
    memo = { indexById, nodes: nodesById, values };

    return values;
  }

  return null;
};

const patchValues = (previous: NonNullable<typeof memo>, nodesById: TNodesById): TSceneNode[] | null => {
  const changed = getChangedNodes(previous.nodes, nodesById);

  switch (true) {
    case changed.all:
    case changed.added > 0:
    case changed.removed > 0:
      return null;
    default:
      return replaceChanged(previous, nodesById, changed);
  }
};

const rememberValues = (nodesById: TNodesById, values: TSceneNode[]): void => {
  if (memo?.nodes !== nodesById) {
    memo = { indexById: null, nodes: nodesById, values };
  }
};

export const getNodeValues = (nodesById: TNodesById): TSceneNode[] => {
  const cached = valuesByNodes.get(nodesById);

  if (!cached) {
    const values = (memo && patchValues(memo, nodesById)) ?? Object.values(nodesById);

    rememberValues(nodesById, values);
    valuesByNodes.set(nodesById, values);

    return values;
  }

  return cached;
};
