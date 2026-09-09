// types
import { LayoutMode, NodeType } from 'types/design/enums';
import { TDesignState } from '../../../types';

// utils
import { applyAutoLayoutSyncChildPosition } from './applyAutoLayoutSyncChildPosition';
import { getActivePage } from '../../getActivePage';
import { getAutoLayoutSyncChildren } from './getAutoLayoutSyncChildren';
import { getAutoLayoutSyncPositions } from './getAutoLayoutSyncPositions';
import { getGridLayoutSyncPositions } from './getGridLayoutSyncPositions';

export const syncAutoLayoutChildren = (state: TDesignState, frameId: string | null): void => {
  if (frameId) {
    const { nodes } = getActivePage(state);
    const frame = nodes[frameId];

    if (frame && frame.type === NodeType.frame) {
      const { layoutMode } = frame;

      if (layoutMode === LayoutMode.horizontal || layoutMode === LayoutMode.vertical || layoutMode === LayoutMode.grid) {
        const { bounds, children, sizes } = getAutoLayoutSyncChildren(frame, nodes);
        const positions =
          layoutMode === LayoutMode.grid ? getGridLayoutSyncPositions(frame, sizes) : getAutoLayoutSyncPositions(frame, layoutMode, sizes);
        const frameCenter = { x: frame.x + frame.width / 2, y: frame.y + frame.height / 2 };

        children.forEach((child, index) => {
          applyAutoLayoutSyncChildPosition(state, nodes, frame, frameCenter, child, bounds[index], positions[index]);
        });
      }
    }
  }
};
