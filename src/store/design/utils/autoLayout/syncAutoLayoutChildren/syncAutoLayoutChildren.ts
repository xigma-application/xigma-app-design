// types
import { LayoutMode, NodeType } from 'types/design/enums';
import { TAutoLayoutChildPosition, TAutoLayoutChildSize } from '../getAutoLayoutChildPositions/getAutoLayoutChildPositions';
import { TDesignState } from '../../../types';
import { TFrameNode } from 'types/design/types';

// utils
import { applyAutoLayoutSyncChildPosition } from './applyAutoLayoutSyncChildPosition/applyAutoLayoutSyncChildPosition';
import { getActivePage } from '../../getActivePage';
import { getAutoLayoutSyncChildren } from './getAutoLayoutSyncChildren';
import { getAutoLayoutSyncPositions } from './getAutoLayoutSyncPositions';
import { getGridLayoutSyncPositions } from './getGridLayoutSyncPositions';

const getSyncPositions = (
  frame: TFrameNode,
  layoutMode: LayoutMode.horizontal | LayoutMode.vertical | LayoutMode.grid,
  sizes: TAutoLayoutChildSize[],
): TAutoLayoutChildPosition[] =>
  layoutMode === LayoutMode.grid ? getGridLayoutSyncPositions(frame, sizes) : getAutoLayoutSyncPositions(frame, layoutMode, sizes);

export const syncAutoLayoutChildren = (state: TDesignState, frameId: string | null): void => {
  if (frameId) {
    const { nodes } = getActivePage(state);
    const frame = nodes[frameId];

    if (frame && frame.type === NodeType.frame) {
      const { layoutMode } = frame;

      if (layoutMode === LayoutMode.horizontal || layoutMode === LayoutMode.vertical || layoutMode === LayoutMode.grid) {
        const { bounds, children, sizes } = getAutoLayoutSyncChildren(frame, nodes);
        const positions = getSyncPositions(frame, layoutMode, sizes);
        const frameCenter = { x: frame.x + frame.width / 2, y: frame.y + frame.height / 2 };

        children.forEach((child, index) => {
          applyAutoLayoutSyncChildPosition(state, nodes, frame, frameCenter, child, bounds[index], positions[index]);
        });
      }
    }
  }
};
