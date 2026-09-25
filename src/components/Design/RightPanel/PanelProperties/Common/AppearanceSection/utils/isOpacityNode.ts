// types
import { NodeType } from 'types/design/enums';
import { TEllipseNode, TSceneNode } from 'types/design/types';
import { TStyledNode } from '../types';

// utils
import { isStyledNode } from './isStyledNode';

export const isOpacityNode = (node: TSceneNode | undefined): node is TEllipseNode | TStyledNode =>
  isStyledNode(node) || node?.type === NodeType.ellipse;
