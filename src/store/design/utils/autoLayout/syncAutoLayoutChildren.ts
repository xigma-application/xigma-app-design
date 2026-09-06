// types
import { TDesignState } from '../../types';
import { AlignmentLayout, LayoutMode, NodeType } from 'types/design/enums';

// utils
import { computeAutoLayoutPositions } from './computeAutoLayoutPositions';
import { getActivePage } from '../getActivePage';
import { getAutoLayoutChildLocalBounds } from './getAutoLayoutChildLocalBounds';
import { getAutoLayoutRotatedSlotPosition } from './getAutoLayoutRotatedSlotPosition';
import { getFramePadding } from './getFramePadding';
import { getGeometryDeltaChanges } from 'components/Design/Canvas/utils/getGeometryDeltaChanges';
import { getGroupSubtreeNodes } from '../nodeHierarchy/getGroupSubtreeNodes';

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
      const bounds = children.map((child) => getAutoLayoutChildLocalBounds(child, frame.rotation));
      const sizes = bounds.map((bound, index) => ({ height: bound.height, id: children[index].id, width: bound.width }));
      const isHorizontal = frame.layoutMode === LayoutMode.horizontal;
      const itemSpacing = (isHorizontal ? frame.horizontalGap : frame.verticalGap) ?? 0;
      const counterAxisSpacing = (isHorizontal ? frame.verticalGap : frame.horizontalGap) ?? itemSpacing;
      const padding = getFramePadding(frame);
      const alignment = frame.layoutAlignment ?? AlignmentLayout.topLeft;
      const positions = computeAutoLayoutPositions(frame, frame.layoutMode, itemSpacing, counterAxisSpacing, alignment, padding, sizes);
      const frameCenter = { x: frame.x + frame.width / 2, y: frame.y + frame.height / 2 };

      children.forEach((child, index) => {
        const targetPosition = getAutoLayoutRotatedSlotPosition(positions[index], bounds[index], frameCenter, frame.rotation);
        const deltaX = targetPosition.x - bounds[index].x;
        const deltaY = targetPosition.y - bounds[index].y;

        getGroupSubtreeNodes(child, nodes).forEach((subtreeNode) => {
          Object.assign(subtreeNode, getGeometryDeltaChanges(subtreeNode, deltaX, deltaY));
        });
      });
    }
  }
};
