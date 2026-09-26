// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';
import { TStyledOrVectorNode } from '../types';

// utils
import { isStyledNode } from './isStyledNode';

export const isStyledOrVectorNode = (node: TSceneNode | undefined): node is TStyledOrVectorNode =>
  isStyledNode(node) || node?.type === NodeType.vector;
