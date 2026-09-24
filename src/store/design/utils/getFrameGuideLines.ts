// types
import { NodeType } from 'types/design/enums';
import { TGuideLine } from 'types/design/guides/types';
import { TSceneNode } from 'types/design/types';

// utils
import { getChangedNodes } from './getChangedNodes';
import { getFrameGuideSpan } from './getFrameGuideSpan';

type TNodesById = Record<string, TSceneNode>;

let memo: { lines: TGuideLine[]; nodes: TNodesById } | null = null;

const buildFrameGuideLines = (nodes: TNodesById): TGuideLine[] => {
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

const isUnaffectedByChanges = (previous: TNodesById, nodes: TNodesById): boolean => {
  const changed = getChangedNodes(previous, nodes);
  return !changed.all && !changed.nodes.some((node) => node.type === NodeType.frame);
};

const rebuildFrameGuideLines = (nodes: TNodesById): TGuideLine[] => {
  const lines = buildFrameGuideLines(nodes);
  memo = { lines, nodes };

  return lines;
};

export const getFrameGuideLines = (nodes: TNodesById): TGuideLine[] => {
  if (!memo || (memo.nodes !== nodes && !isUnaffectedByChanges(memo.nodes, nodes))) {
    return rebuildFrameGuideLines(nodes);
  }

  memo = { lines: memo.lines, nodes };
  return memo.lines;
};
