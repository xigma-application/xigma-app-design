// types
import { TDesignState } from '../../types';
import { AlignmentLayout, LayoutMode, NodeType } from 'types/design/enums';

// utils
import { applyAutoLayoutHugSize } from './applyAutoLayoutHugSize';
import { getActivePage } from '../getActivePage';
import { getAutoLayoutChildPositions } from './getAutoLayoutChildPositions';
import { getAutoLayoutContentBox } from './getAutoLayoutContentBox';
import { getFramePadding } from './getFramePadding';
import { getGeometryDeltaChanges } from 'components/Design/Canvas/utils/getGeometryDeltaChanges';
import { getGroupSubtreeNodes } from '../nodeHierarchy/getGroupSubtreeNodes';
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
      const itemSpacing = frame.itemSpacing ?? 0;
      const padding = getFramePadding(frame);

      applyAutoLayoutHugSize(frame, frame.layoutMode, itemSpacing, padding, sizes);

      const contentBox = getAutoLayoutContentBox(frame, padding);
      const positions = getAutoLayoutChildPositions(
        frame.layoutMode,
        itemSpacing,
        frame.layoutAlignment ?? AlignmentLayout.topLeft,
        contentBox,
        sizes,
      );

      children.forEach((child, index) => {
        const deltaX = positions[index].x - bounds[index].x;
        const deltaY = positions[index].y - bounds[index].y;

        getGroupSubtreeNodes(child, nodes).forEach((subtreeNode) => {
          Object.assign(subtreeNode, getGeometryDeltaChanges(subtreeNode, deltaX, deltaY));
        });
      });
    }
  }
};
