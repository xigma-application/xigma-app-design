// types
import { LayoutMode } from 'types/design/enums';
import { TDraftRect } from 'types/canvas';
import { TFrameNode, TSceneNode } from 'types/design/types';

// utils
import { getAutoLayoutNodeLocalBounds } from './getAutoLayoutNodeLocalBounds';

export type TAutoLayoutGapHandles = {
  horizontal: TDraftRect[];
  vertical: TDraftRect[];
};

const EMPTY_HANDLES: TAutoLayoutGapHandles = { horizontal: [], vertical: [] };

const primaryOf = (bound: TDraftRect, axis: 'x' | 'y'): number => (axis === 'x' ? bound.x : bound.y);

const primaryEndOf = (bound: TDraftRect, axis: 'x' | 'y'): number => (axis === 'x' ? bound.x + bound.width : bound.y + bound.height);

const buildRect = (axis: 'x' | 'y', primaryStart: number, primaryEnd: number, bandStart: number, bandEnd: number): TDraftRect =>
  axis === 'x'
    ? { height: bandEnd - bandStart, width: primaryEnd - primaryStart, x: primaryStart, y: bandStart }
    : { height: primaryEnd - primaryStart, width: bandEnd - bandStart, x: bandStart, y: primaryStart };

const groupBoundsIntoLines = (bounds: TDraftRect[], axis: 'x' | 'y'): TDraftRect[][] => {
  const lines: TDraftRect[][] = [];
  let currentLine: TDraftRect[] = [];

  bounds.forEach((bound, index) => {
    const previous = bounds[index - 1];

    if (previous && primaryOf(bound, axis) <= primaryOf(previous, axis)) {
      lines.push(currentLine);
      currentLine = [];
    }

    currentLine.push(bound);
  });

  lines.push(currentLine);

  return lines;
};

const getWithinLineGaps = (lines: TDraftRect[][], axis: 'x' | 'y'): TDraftRect[] => {
  const perpendicular = axis === 'x' ? 'y' : 'x';

  return lines.flatMap((line) => {
    const bandStart = Math.min(...line.map((bound) => primaryOf(bound, perpendicular)));
    const bandEnd = Math.max(...line.map((bound) => primaryEndOf(bound, perpendicular)));

    return line
      .slice(1)
      .map((bound, index) => buildRect(axis, primaryEndOf(line[index], axis), primaryOf(bound, axis), bandStart, bandEnd));
  });
};

const getBetweenLineGaps = (lines: TDraftRect[][], axis: 'x' | 'y'): TDraftRect[] => {
  const perpendicular = axis === 'x' ? 'y' : 'x';

  return lines.slice(1).map((line, index) => {
    const previousLine = lines[index];
    const combined = [...previousLine, ...line];
    const bandStart = Math.min(...combined.map((bound) => primaryOf(bound, axis)));
    const bandEnd = Math.max(...combined.map((bound) => primaryEndOf(bound, axis)));
    const gapStart = Math.max(...previousLine.map((bound) => primaryEndOf(bound, perpendicular)));
    const gapEnd = Math.min(...line.map((bound) => primaryOf(bound, perpendicular)));

    return buildRect(perpendicular, gapStart, gapEnd, bandStart, bandEnd);
  });
};

export const getAutoLayoutGapHandles = (frame: TFrameNode, children: TSceneNode[]): TAutoLayoutGapHandles => {
  const isValidMode = frame.layoutMode === LayoutMode.horizontal || frame.layoutMode === LayoutMode.vertical;

  if (!isValidMode || children.length < 2) {
    return EMPTY_HANDLES;
  }

  const primaryAxis: 'x' | 'y' = frame.layoutMode === LayoutMode.horizontal ? 'x' : 'y';
  const bounds = children.map((child) => getAutoLayoutNodeLocalBounds(child, frame));
  const lines = groupBoundsIntoLines(bounds, primaryAxis);
  const withinLineGaps = getWithinLineGaps(lines, primaryAxis);
  const betweenLineGaps = getBetweenLineGaps(lines, primaryAxis);

  return primaryAxis === 'x'
    ? { horizontal: withinLineGaps, vertical: betweenLineGaps }
    : { horizontal: betweenLineGaps, vertical: withinLineGaps };
};
