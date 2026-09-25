// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';
import { TStyledNode, isAppearanceNode } from '../types';

export const isStyledNode = (node: TSceneNode | undefined): node is TStyledNode =>
  isAppearanceNode(node) || node?.type === NodeType.ellipse || node?.type === NodeType.line;
