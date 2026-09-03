// types
import { TBoxSceneNode, TSceneNode } from 'types/design/types';

// utils
import { isBoxSceneNode } from 'components/Design/Canvas/utils/isBoxSceneNode';

export const forEachClipboardTargetPair = (
  selectedIds: string[],
  clipboardRootIds: string[],
  clipboardNodesById: Record<string, TSceneNode>,
  nodes: Record<string, TSceneNode>,
  callback: (target: TBoxSceneNode, clipboardRoot: TBoxSceneNode, targetId: string) => void,
): void => {
  selectedIds.forEach((targetId, index) => {
    const target = nodes[targetId];
    const clipboardRootId = clipboardRootIds.length === 1 ? clipboardRootIds[0] : clipboardRootIds[index];
    const clipboardRoot = clipboardNodesById[clipboardRootId];

    if (target && clipboardRoot && isBoxSceneNode(target) && isBoxSceneNode(clipboardRoot)) {
      callback(target, clipboardRoot, targetId);
    }
  });
};
