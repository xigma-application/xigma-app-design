// types
import { GapMode, LayoutMode } from 'types/design/enums';
import { TAutoLayoutGapAxis, TAutoLayoutGapHandles } from './types';
import { TFrameNode, TSceneNode } from 'types/design/types';

// utils
import { EMPTY_AUTO_LAYOUT_GAP_HANDLES } from './constants';
import { getAutoLayoutBetweenLineGaps } from './getAutoLayoutBetweenLineGaps';
import { getAutoLayoutNodeLocalBounds } from '../getAutoLayoutNodeLocalBounds';
import { getAutoLayoutWithinLineGaps } from './getAutoLayoutWithinLineGaps';
import { groupAutoLayoutGapBoundsIntoLines } from './groupAutoLayoutGapBoundsIntoLines';

export const getAutoLayoutGapHandles = (frame: TFrameNode, children: TSceneNode[]): TAutoLayoutGapHandles => {
  const isValidMode = frame.layoutMode === LayoutMode.horizontal || frame.layoutMode === LayoutMode.vertical;

  if (!isValidMode || children.length < 2) {
    return EMPTY_AUTO_LAYOUT_GAP_HANDLES;
  }

  const primaryAxis: TAutoLayoutGapAxis = frame.layoutMode === LayoutMode.horizontal ? 'x' : 'y';
  const bounds = children.map((child) => getAutoLayoutNodeLocalBounds(child, frame));
  const lines = groupAutoLayoutGapBoundsIntoLines(bounds, primaryAxis);
  const withinLineGaps = getAutoLayoutWithinLineGaps(lines, primaryAxis);
  const betweenLineGaps = getAutoLayoutBetweenLineGaps(lines, primaryAxis);
  const horizontalGaps = primaryAxis === 'x' ? withinLineGaps : betweenLineGaps;
  const verticalGaps = primaryAxis === 'x' ? betweenLineGaps : withinLineGaps;

  return {
    horizontal: frame.horizontalGapMode === GapMode.auto ? [] : horizontalGaps,
    vertical: frame.verticalGapMode === GapMode.auto ? [] : verticalGaps,
  };
};
