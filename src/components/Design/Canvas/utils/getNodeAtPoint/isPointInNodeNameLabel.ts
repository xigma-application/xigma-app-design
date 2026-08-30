// types
import { NodeType } from 'types/design/enums';
import { TPoint } from 'types/canvas';
import { TSceneNode } from 'types/design/types';

// utils
import { TFrameNameLabelRect, isPointInFrameNameLabelRect } from '../getFrameNameLabelRects';
import { TSectionNameLabelRect, isPointInSectionNameLabelRect } from '../getSectionNameLabelRects';

export const isPointInNodeNameLabel = (
  point: TPoint,
  node: TSceneNode,
  frameNameLabelRects: TFrameNameLabelRect[],
  sectionNameLabelRects: TSectionNameLabelRect[],
): boolean => {
  switch (node.type) {
    case NodeType.frame: {
      const labelRect = frameNameLabelRects.find((rect) => rect.nodeId === node.id);
      return Boolean(labelRect && isPointInFrameNameLabelRect(point, labelRect));
    }
    case NodeType.section: {
      const labelRect = sectionNameLabelRects.find((rect) => rect.nodeId === node.id);
      return Boolean(labelRect && isPointInSectionNameLabelRect(point, labelRect));
    }
    default:
      return false;
  }
};
