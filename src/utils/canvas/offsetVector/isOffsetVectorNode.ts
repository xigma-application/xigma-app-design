// types
import { NodeType } from 'types/design/enums';
import { TOffsetVectorNode } from './types';
import { TSceneNode } from 'types/design/types';

export const isOffsetVectorNode = (node: TSceneNode | undefined): node is TOffsetVectorNode =>
  node?.type === NodeType.line || node?.type === NodeType.polygon;
