// types
import { TSceneNode } from 'types/design/types';

const visibleNodesBySource = new WeakMap<TSceneNode[], TSceneNode[]>();

export const getVisibleRenderNodes = (renderOrderedNodes: TSceneNode[]): TSceneNode[] => {
  const cached = visibleNodesBySource.get(renderOrderedNodes);

  if (!cached) {
    const visibleNodes = renderOrderedNodes.filter((node) => !node.hidden);
    visibleNodesBySource.set(renderOrderedNodes, visibleNodes);

    return visibleNodes;
  }

  return cached;
};
