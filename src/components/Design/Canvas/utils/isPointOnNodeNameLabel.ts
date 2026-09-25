// types
import { NodeType } from 'types/design/enums';
import { TPoint } from 'types/canvas';
import { TSceneNode } from 'types/design/types';

// utils
import { getSectionNameLabelRects, isPointInSectionNameLabelRect } from './getSectionNameLabelRects';
import { isPointOnFrameNameLabel } from './isPointOnFrameNameLabel';

export const isPointOnNodeNameLabel = (point: TPoint, node: TSceneNode, zoom: number, nodesById: Record<string, TSceneNode>): boolean => {
  switch (node.type) {
    case NodeType.frame:
      return isPointOnFrameNameLabel(point, node, zoom);
    case NodeType.section: {
      const [labelRect] = getSectionNameLabelRects([node], zoom, nodesById);
      return Boolean(labelRect && isPointInSectionNameLabelRect(point, labelRect));
    }
    default:
      return false;
  }
};
