// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';
import { TSvgShapeNode } from './types';

// utils
import { canExportBoxShapeAsSvgVector } from './canExportBoxShapeAsSvgVector';
import { canExportLineAsSvgVector } from './canExportLineAsSvgVector';
import { canExportSimpleShapeAsSvgVector } from './canExportSimpleShapeAsSvgVector';

export const canExportShapeAsSvgVector = (node: TSvgShapeNode, nodesById: Record<string, TSceneNode>): boolean => {
  switch (node.type) {
    case NodeType.frame:
    case NodeType.rectangle:
      return canExportBoxShapeAsSvgVector(node, nodesById);
    case NodeType.line:
      return canExportLineAsSvgVector(node, nodesById);
    default:
      return canExportSimpleShapeAsSvgVector(node, nodesById);
  }
};
