// types
import { TEditingTextBox, TPoint } from 'types/canvas';
import { TGlyphAtlasJson } from 'types/msdf';
import { TSceneNode } from 'types/design/types';

// utils
import { flipTextPoint } from './flipTextPoint';
import { getCurvedGlyphBoundaries } from './getCurvedGlyphBoundaries';
import { getTextPathSampler } from './pathSampler/getTextPathSampler';
import { getVisibleCurvedContent } from './getVisibleCurvedContent';
import { rotatePoint } from 'utils/math/rotatePoint';

export type TCurvedCaretHit = {
  distance: number;
  index: number;
};

export const getCurvedCaretIndexAtPoint = (
  atlas: TGlyphAtlasJson,
  content: string,
  fontSize: number,
  box: TEditingTextBox,
  point: TPoint,
  pathNode?: TSceneNode,
): TCurvedCaretHit => {
  const lineHeight = (atlas.common.lineHeight * fontSize) / atlas.info.size;
  const baseRatio = atlas.common.base / atlas.common.lineHeight;
  const halfBand = Math.max(lineHeight * baseRatio, lineHeight * (1 - baseRatio));
  const sampler = getTextPathSampler(box, pathNode);
  const visibleContent = getVisibleCurvedContent(
    atlas,
    content,
    fontSize,
    box.pathStartOffset ?? 0,
    box.pathFlip ?? false,
    sampler.totalLength,
    sampler.isClosed,
  );
  const boundaries = getCurvedGlyphBoundaries(
    atlas,
    visibleContent,
    fontSize,
    box.pathStartOffset ?? 0,
    box.pathFlip ?? false,
    sampler.totalLength,
  );
  const minBoundary = Math.min(boundaries[0], boundaries[boundaries.length - 1]);
  const maxBoundary = Math.max(boundaries[0], boundaries[boundaries.length - 1]);
  const center: TPoint = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
  const unrotated = rotatePoint(point, center, -box.rotation);
  const localPoint = flipTextPoint(unrotated, box);
  const nearest = sampler.nearestOffsetAtPoint(localPoint);
  const rawLength = nearest.offset * sampler.totalLength;
  const distanceToRange = (length: number): number => (length < minBoundary ? minBoundary - length : Math.max(length - maxBoundary, 0));
  const wrapCandidates = sampler.isClosed ? [rawLength - sampler.totalLength, rawLength, rawLength + sampler.totalLength] : [rawLength];
  const nearestLength = wrapCandidates.reduce((closest, candidate) =>
    distanceToRange(candidate) < distanceToRange(closest) ? candidate : closest,
  );

  const clampedLength = Math.min(Math.max(nearestLength, minBoundary), maxBoundary);
  let bestIndex = 0;
  let bestDistance = Infinity;

  boundaries.forEach((boundary, index) => {
    const distance = Math.abs(boundary - clampedLength);

    if (distance < bestDistance) {
      bestDistance = distance;
      bestIndex = index;
    }
  });

  const distance = Math.max(nearest.distance - halfBand, 0) + distanceToRange(nearestLength);

  return { distance, index: bestIndex };
};
