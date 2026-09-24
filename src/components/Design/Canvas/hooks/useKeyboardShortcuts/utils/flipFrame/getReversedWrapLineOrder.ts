// types
import { LayoutMode } from 'types/design/enums';
import { TFlipAxis } from './types';
import { TFrameNode, TSceneNode } from 'types/design/types';

// utils
import { getRotatedNodeBounds } from 'components/Design/Canvas/utils/getRotatedNodeBounds';
import { isBoxSceneNode } from 'components/Design/Canvas/utils/isBoxSceneNode';

const isFlowChild = (node: TSceneNode | undefined): node is TSceneNode =>
  node !== undefined && !(isBoxSceneNode(node) && node.ignoreAutoLayout);

const isCrossAxisFlip = (frame: TFrameNode, axis: TFlipAxis): boolean =>
  (frame.layoutMode === LayoutMode.horizontal && axis === 'vertical') ||
  (frame.layoutMode === LayoutMode.vertical && axis === 'horizontal');

const getWrapLines = (children: TSceneNode[], isRowFlow: boolean): string[][] => {
  const lines: { end: number; ids: string[] }[] = [];

  children.forEach((child) => {
    const bounds = getRotatedNodeBounds(child);
    const start = isRowFlow ? bounds.y : bounds.x;
    const end = start + (isRowFlow ? bounds.height : bounds.width);
    const line = lines.at(-1);

    if (line && start < line.end) {
      line.ids.push(child.id);
      line.end = Math.min(line.end, end);
    } else {
      lines.push({ end, ids: [child.id] });
    }
  });

  return lines.map((line) => line.ids);
};

export const getReversedWrapLineOrder = (frame: TFrameNode, nodes: Record<string, TSceneNode>, axis: TFlipAxis): string[] | null => {
  if (frame.layoutWrap && isCrossAxisFlip(frame, axis)) {
    const flowChildren = frame.childIds.map((id) => nodes[id]).filter(isFlowChild);
    const reversed = getWrapLines(flowChildren, frame.layoutMode === LayoutMode.horizontal)
      .reverse()
      .flat();
    let flowIndex = 0;

    return frame.childIds.map((id) => (isFlowChild(nodes[id]) ? reversed[flowIndex++] : id));
  }

  return null;
};
