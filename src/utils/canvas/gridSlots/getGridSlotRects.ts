// types
import { TDraftRect } from 'types/canvas';
import { TFrameNode, TSceneNode } from 'types/design/types';

// utils
import { getGridSlotRect } from './getGridSlotRect';
import { getGridTrackLayout } from './getGridTrackLayout';

export const getGridSlotRects = (frame: TFrameNode, nodesById: Record<string, TSceneNode>): TDraftRect[] => {
  const layout = getGridTrackLayout(frame, nodesById);
  const rects: TDraftRect[] = [];

  for (let row = 0; row < layout.rowCount; row += 1) {
    for (let column = 0; column < layout.columnCount; column += 1) {
      rects.push(getGridSlotRect(layout, frame, column, row));
    }
  }

  return rects;
};
