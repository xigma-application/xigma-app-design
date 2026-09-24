// types
import { TSceneNode } from 'types/design/types';

export type TChangedNodes = { added: number; all: boolean; ids: Set<string>; nodes: TSceneNode[]; removed: number };

type TNodesById = Record<string, TSceneNode>;

const MAX_TRACKED_CHANGES = 64;

const keyCounts = new WeakMap<TNodesById, number>();

let memo: { from: TNodesById; result: TChangedNodes; to: TNodesById } | null = null;

const collectRemoved = (from: TNodesById, to: TNodesById, result: TChangedNodes): void => {
  for (const id in from) {
    if (!(id in to)) {
      result.ids.add(id);
      result.nodes.push(from[id]);
    }
  }
};

const collectReplaced = (from: TNodesById, to: TNodesById, result: TChangedNodes): number => {
  let toCount = 0;

  for (const id in to) {
    toCount += 1;

    if (from[id] !== to[id]) {
      result.ids.add(id);
      result.nodes.push(to[id]);

      if (from[id]) {
        result.nodes.push(from[id]);
      } else {
        result.added += 1;
      }

      if (result.ids.size > MAX_TRACKED_CHANGES) {
        result.all = true;

        return toCount;
      }
    }
  }

  return toCount;
};

const collectChanges = (from: TNodesById, to: TNodesById): TChangedNodes => {
  const result: TChangedNodes = { added: 0, all: false, ids: new Set(), nodes: [], removed: 0 };
  const toCount = collectReplaced(from, to, result);

  if (!result.all) {
    const fromCount = keyCounts.get(from) ?? Object.keys(from).length;
    result.removed = fromCount - (toCount - result.added);

    if (result.removed > 0) {
      collectRemoved(from, to, result);
      result.all = result.ids.size > MAX_TRACKED_CHANGES;
    }

    keyCounts.set(from, fromCount);
    keyCounts.set(to, toCount);
  }

  return result;
};

export const getChangedNodes = (from: TNodesById, to: TNodesById): TChangedNodes => {
  if (!memo || memo.from !== from || memo.to !== to) {
    const result = collectChanges(from, to);
    memo = { from, result, to };

    return result;
  }

  return memo.result;
};
