// types
import { NodeType } from 'types/design/enums';
import { TGuideLine } from 'types/design/guides/types';
import { TSceneNode } from 'types/design/types';

// utils
import { getFrameGuideSpan } from './getFrameGuideSpan';

export const getFrameGuideLines = (nodes: Record<string, TSceneNode>): TGuideLine[] => {
  const lines: TGuideLine[] = [];

  Object.values(nodes).forEach((node) => {
    if (node.type === NodeType.frame && node.rotation === 0) {
      node.guides?.forEach((guide) => {
        lines.push({
          axis: guide.axis,
          frameId: node.id,
          id: guide.id,
          span: getFrameGuideSpan(node, guide.axis),
          worldPosition: guide.axis === 'x' ? node.x + guide.position : node.y + guide.position,
        });
      });
    }
  });

  return lines;
};
