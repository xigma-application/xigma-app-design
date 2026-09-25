// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';
import { TSvgShapeNode } from './types';

// utils
import { canExportBoxShapeAsSvgVector } from './canExportBoxShapeAsSvgVector';
import { canExportPaintShapeAsSvgVector } from './canExportPaintShapeAsSvgVector';
import { canExportLineAsSvgVector } from './canExportLineAsSvgVector';
import { canExportMediaNodeAsSvgVector } from './canExportMediaNodeAsSvgVector';
import { canExportVectorNodeAsSvgVector } from './canExportVectorNodeAsSvgVector';

export const canExportShapeAsSvgVector = (node: TSvgShapeNode, nodesById: Record<string, TSceneNode>): boolean => {
  switch (node.type) {
    case NodeType.frame:
    case NodeType.rectangle:
      return canExportBoxShapeAsSvgVector(node, nodesById);
    case NodeType.ellipse:
    case NodeType.polygon:
    case NodeType.star:
      return canExportPaintShapeAsSvgVector(node, nodesById);
    case NodeType.line:
      return canExportLineAsSvgVector(node, nodesById);
    case NodeType.vector:
      return canExportVectorNodeAsSvgVector(node, nodesById);
    default:
      return canExportMediaNodeAsSvgVector(node, nodesById);
  }
};
