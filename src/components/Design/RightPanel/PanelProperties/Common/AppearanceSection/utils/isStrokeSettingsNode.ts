// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';
import { TStrokeSettingsNode } from '../types';

// utils
import { isStyledNode } from './isStyledNode';

export const isStrokeSettingsNode = (node: TSceneNode | undefined): node is TStrokeSettingsNode =>
  isStyledNode(node) || node?.type === NodeType.vector;
