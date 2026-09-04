// types
import { TDesignState } from '../../types';
import { AlignmentLayout, LayoutMode, NodeType } from 'types/design/enums';

// utils
import { getActivePage } from '../getActivePage';
import { getAutoLayoutChildPositions } from './getAutoLayoutChildPositions';
import { getGeometryDeltaChanges } from 'components/Design/Canvas/utils/getGeometryDeltaChanges';
import { getNodeAxisAlignedBounds } from '../getNodeAxisAlignedBounds';

export const syncAutoLayoutChildren = (state: TDesignState, frameId: string | null): void => {
  if (frameId) {
    const { nodes } = getActivePage(state);
    const frame = nodes[frameId];

    if (
      frame &&
      frame.type === NodeType.frame &&
      (frame.layoutMode === LayoutMode.horizontal || frame.layoutMode === LayoutMode.vertical)
    ) {
      const children = frame.childIds.map((childId) => nodes[childId]).filter(Boolean);
      const bounds = children.map(getNodeAxisAlignedBounds);
      const sizes = bounds.map((bound, index) => ({ height: bound.height, id: children[index].id, width: bound.width }));
      const positions = getAutoLayoutChildPositions(
        frame.layoutMode,
        frame.itemSpacing ?? 0,
        frame.layoutAlignment ?? AlignmentLayout.topLeft,
        frame,
        sizes,
      );

      children.forEach((child, index) => {
        const deltaX = positions[index].x - bounds[index].x;
        const deltaY = positions[index].y - bounds[index].y;

        Object.assign(child, getGeometryDeltaChanges(child, deltaX, deltaY));
      });
    }
  }
};
