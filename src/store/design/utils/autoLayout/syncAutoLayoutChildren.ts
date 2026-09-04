// types
import { TDesignState } from '../../types';
import { AlignmentLayout, LayoutMode, NodeType } from 'types/design/enums';

// utils
import { getActivePage } from '../getActivePage';
import { getAutoLayoutChildPositions } from './getAutoLayoutChildPositions';
import { isBoxSceneNode } from './isBoxSceneNode';

export const syncAutoLayoutChildren = (state: TDesignState, frameId: string | null): void => {
  if (frameId) {
    const { nodes } = getActivePage(state);
    const frame = nodes[frameId];

    if (
      frame &&
      frame.type === NodeType.frame &&
      (frame.layoutMode === LayoutMode.horizontal || frame.layoutMode === LayoutMode.vertical)
    ) {
      const children = frame.childIds
        .map((childId) => nodes[childId])
        .filter(Boolean)
        .filter(isBoxSceneNode);
      const positions = getAutoLayoutChildPositions(
        frame.layoutMode,
        frame.itemSpacing ?? 0,
        frame.layoutAlignment ?? AlignmentLayout.topLeft,
        frame,
        children,
      );

      children.forEach((child, index) => {
        child.x = positions[index].x;
        child.y = positions[index].y;
      });
    }
  }
};
