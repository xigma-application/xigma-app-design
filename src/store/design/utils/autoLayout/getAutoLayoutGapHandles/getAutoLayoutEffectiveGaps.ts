// types
import { LayoutMode } from 'types/design/enums';
import { TAutoLayoutGapAxis } from './types';
import { TDraftRect } from 'types/canvas';
import { TFrameNode, TSceneNode } from 'types/design/types';

// utils
import { getAutoLayoutBetweenLineGaps } from './getAutoLayoutBetweenLineGaps';
import { getAutoLayoutNodeLocalBounds } from '../getAutoLayoutNodeLocalBounds';
import { getAutoLayoutWithinLineGaps } from './getAutoLayoutWithinLineGaps';
import { groupAutoLayoutGapBoundsIntoLines } from './groupAutoLayoutGapBoundsIntoLines';

export type TAutoLayoutEffectiveGaps = { horizontal: number; vertical: number };

const readGapSize = (rect: TDraftRect | undefined, axis: TAutoLayoutGapAxis, fallback: number): number =>
  rect ? (axis === 'x' ? rect.width : rect.height) : fallback;

export const getAutoLayoutEffectiveGaps = (frame: TFrameNode, children: TSceneNode[]): TAutoLayoutEffectiveGaps => {
  const fallback: TAutoLayoutEffectiveGaps = { horizontal: frame.horizontalGap ?? 0, vertical: frame.verticalGap ?? 0 };
  const isValidMode = frame.layoutMode === LayoutMode.horizontal || frame.layoutMode === LayoutMode.vertical;

  if (isValidMode && children.length >= 2) {
    const primaryAxis: TAutoLayoutGapAxis = frame.layoutMode === LayoutMode.horizontal ? 'x' : 'y';
    const bounds = children.map((child) => getAutoLayoutNodeLocalBounds(child, frame));
    const lines = groupAutoLayoutGapBoundsIntoLines(bounds, primaryAxis);
    const withinLineGaps = getAutoLayoutWithinLineGaps(lines, primaryAxis);
    const betweenLineGaps = getAutoLayoutBetweenLineGaps(lines, primaryAxis);

    return primaryAxis === 'x'
      ? {
          horizontal: readGapSize(withinLineGaps[0], 'x', fallback.horizontal),
          vertical: readGapSize(betweenLineGaps[0], 'y', fallback.vertical),
        }
      : {
          horizontal: readGapSize(betweenLineGaps[0], 'x', fallback.horizontal),
          vertical: readGapSize(withinLineGaps[0], 'y', fallback.vertical),
        };
  }

  return fallback;
};
