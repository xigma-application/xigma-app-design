// types
import { NodeType } from 'types/design/enums';
import { TGuideLine } from 'types/design/guides/types';
import { TSceneNode } from 'types/design/types';

export const getFrameGuideLines = (nodes: Record<string, TSceneNode>): TGuideLine[] => {
  const lines: TGuideLine[] = [];

  Object.values(nodes).forEach((node) => {
    if (node.type === NodeType.frame && node.rotation === 0) {
      node.guides?.forEach((guide) => {
        lines.push({
          axis: guide.axis,
          frameId: node.id,
          id: guide.id,
          span: guide.axis === 'x' ? { from: node.y, to: node.y + node.height } : { from: node.x, to: node.x + node.width },
          worldPosition: guide.axis === 'x' ? node.x + guide.position : node.y + guide.position,
        });
      });
    }
  });

  return lines;
};
