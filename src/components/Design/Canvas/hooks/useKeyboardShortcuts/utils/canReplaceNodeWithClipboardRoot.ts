// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

export const canReplaceNodeWithClipboardRoot = (clipboardRoot: TSceneNode, target: TSceneNode): boolean =>
  clipboardRoot.type !== NodeType.slice || target.parentId === null;
