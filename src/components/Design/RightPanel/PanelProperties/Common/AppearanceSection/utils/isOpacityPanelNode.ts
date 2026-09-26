// types
import { NodeType } from 'types/design/enums';
import { TOpacityPanelNode } from '../types';
import { TSceneNode } from 'types/design/types';

// utils
import { isStyledNode } from './isStyledNode';

export const isOpacityPanelNode = (node: TSceneNode | undefined): node is TOpacityPanelNode =>
  isStyledNode(node) || node?.type === NodeType.vector;
