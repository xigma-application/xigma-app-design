// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

export const getExportSourceId = (nodeId: string | null, nodesById: Record<string, TSceneNode>): string | null =>
  nodeId !== null && nodesById[nodeId]?.type === NodeType.slice ? null : nodeId;
