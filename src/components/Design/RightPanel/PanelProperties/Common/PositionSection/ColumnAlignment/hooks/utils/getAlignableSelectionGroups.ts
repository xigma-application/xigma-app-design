// types
import { TSceneNode } from 'types/design/types';

// utils
import { getSelectionGroups } from 'components/Design/Canvas/utils/getSelectionGroups';
import { isNudgeableNode } from 'components/Design/Canvas/hooks/useKeyboardShortcuts/utils/isNudgeableNode';

export const getAlignableSelectionGroups = (selectedNodes: TSceneNode[], nodes: Record<string, TSceneNode>): TSceneNode[][] =>
  getSelectionGroups(selectedNodes.filter((node) => isNudgeableNode(node, nodes))).filter((group) => group.length > 1);
