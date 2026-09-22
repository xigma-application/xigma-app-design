// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';
import { TPdfShapeNode } from './types';

// utils
import { canExportBoxShapeAsVector } from './canExportBoxShapeAsVector';
import { canExportSimpleShapeAsVector } from './canExportSimpleShapeAsVector';

export const canExportShapeAsVector = (node: TPdfShapeNode, nodesById: Record<string, TSceneNode>): boolean =>
  node.type === NodeType.frame || node.type === NodeType.rectangle
    ? canExportBoxShapeAsVector(node, nodesById)
    : canExportSimpleShapeAsVector(node, nodesById);
