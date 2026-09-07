// types
import { LayoutMode, NodeType } from 'types/design/enums';
import { TDesignState } from '../../../types';

// utils
import { applyAutoLayoutSyncChildPosition } from './applyAutoLayoutSyncChildPosition';
import { getActivePage } from '../../getActivePage';
import { getAutoLayoutSyncChildren } from './getAutoLayoutSyncChildren';
import { getAutoLayoutSyncPositions } from './getAutoLayoutSyncPositions';

export const syncAutoLayoutChildren = (state: TDesignState, frameId: string | null): void => {
  if (frameId) {
    const { nodes } = getActivePage(state);
    const frame = nodes[frameId];

    if (
      frame &&
      frame.type === NodeType.frame &&
      (frame.layoutMode === LayoutMode.horizontal || frame.layoutMode === LayoutMode.vertical)
    ) {
      const { bounds, children, sizes } = getAutoLayoutSyncChildren(frame, nodes);
      const positions = getAutoLayoutSyncPositions(frame, frame.layoutMode, sizes);
      const frameCenter = { x: frame.x + frame.width / 2, y: frame.y + frame.height / 2 };

      children.forEach((child, index) => {
        applyAutoLayoutSyncChildPosition(state, nodes, frame, frameCenter, child, bounds[index], positions[index]);
      });
    }
  }
};
