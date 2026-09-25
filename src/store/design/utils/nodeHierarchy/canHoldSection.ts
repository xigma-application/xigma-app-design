// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

export const canHoldSection = (parentId: string | null, nodes: Record<string, TSceneNode>): boolean =>
  parentId === null || nodes[parentId]?.type === NodeType.section;
