// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';
import { TPdfShapeNode } from './types';

// utils
import { canExportBoxShapeAsVector } from './canExportBoxShapeAsVector';
import { canExportPaintShapeAsVector } from './canExportPaintShapeAsVector';
import { canExportLineAsVector } from './canExportLineAsVector';
import { canExportSimpleShapeAsVector } from './canExportSimpleShapeAsVector';
import { canExportVectorNodeAsVector } from './canExportVectorNodeAsVector';

export const canExportShapeAsVector = (node: TPdfShapeNode, nodesById: Record<string, TSceneNode>): boolean => {
  switch (node.type) {
    case NodeType.frame:
    case NodeType.rectangle:
      return canExportBoxShapeAsVector(node, nodesById);
    case NodeType.ellipse:
    case NodeType.polygon:
      return canExportPaintShapeAsVector(node, nodesById);
    case NodeType.line:
      return canExportLineAsVector(node, nodesById);
    case NodeType.vector:
      return canExportVectorNodeAsVector(node, nodesById);
    default:
      return canExportSimpleShapeAsVector(node, nodesById);
  }
};
