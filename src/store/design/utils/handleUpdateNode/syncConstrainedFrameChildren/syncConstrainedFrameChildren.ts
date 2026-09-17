// types
import { NodeType } from 'types/design/enums';
import { TDesignState } from '../../../types';

// utils
import { getActivePage } from '../../getActivePage';
import { syncConstrainedFrameChild } from './syncConstrainedFrameChild';

export type TFrameBoxSnapshot = { height: number; rotation: number; width: number; x: number; y: number };

export const syncConstrainedFrameChildren = (
  state: TDesignState,
  frameId: string | null,
  previousBox: TFrameBoxSnapshot | undefined,
): void => {
  if (frameId && previousBox) {
    const { nodes } = getActivePage(state);
    const frame = nodes[frameId];

    if (frame && frame.type === NodeType.frame) {
      const widthDelta = frame.width - previousBox.width;
      const heightDelta = frame.height - previousBox.height;

      frame.childIds.forEach((childId) => syncConstrainedFrameChild(nodes, frame, previousBox, widthDelta, heightDelta, childId));
    }
  }
};
