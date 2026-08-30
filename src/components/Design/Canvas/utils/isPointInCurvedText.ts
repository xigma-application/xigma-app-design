// others
import { MSDF_ATLAS_JSON } from 'constant/webgl/msdfAtlas';

// types
import { TPoint } from 'types/canvas';
import { TSceneNode, TTextNode } from 'types/design/types';

// utils
import { flipTextPoint } from 'utils/canvas/text/flipTextPoint';
import { getCurvedGlyphBoundaries } from 'utils/canvas/text/getCurvedGlyphBoundaries';
import { getTextPathSampler } from 'utils/canvas/text/pathSampler/getTextPathSampler';
import { getVisibleCurvedContent } from 'utils/canvas/text/getVisibleCurvedContent';
import { rotatePoint } from 'utils/math/rotatePoint';

export const isPointInCurvedText = (point: TPoint, node: TTextNode, tolerance: number, pathNode?: TSceneNode): boolean => {
  const sampler = getTextPathSampler(node, pathNode);
  const visibleContent = getVisibleCurvedContent(
    MSDF_ATLAS_JSON,
    node.content,
    node.fontSize,
    node.pathStartOffset ?? 0,
    node.pathFlip ?? false,
    sampler.totalLength,
    sampler.isClosed,
  );
  const boundaries = getCurvedGlyphBoundaries(
    MSDF_ATLAS_JSON,
    visibleContent,
    node.fontSize,
    node.pathStartOffset ?? 0,
    node.pathFlip ?? false,
    sampler.totalLength,
  );
  const minBoundary = Math.min(boundaries[0], boundaries[boundaries.length - 1]);
  const maxBoundary = Math.max(boundaries[0], boundaries[boundaries.length - 1]);
  const center: TPoint = { x: node.x + node.width / 2, y: node.y + node.height / 2 };
  const unrotated = rotatePoint(point, center, -node.rotation);
  const localPoint = flipTextPoint(unrotated, node);
  const nearest = sampler.nearestOffsetAtPoint(localPoint);
  const nearestLength = nearest.offset * sampler.totalLength;
  const wrapCandidates = sampler.isClosed
    ? [nearestLength - sampler.totalLength, nearestLength, nearestLength + sampler.totalLength]
    : [nearestLength];
  const isAlongContent = wrapCandidates.some((length) => length >= minBoundary - tolerance && length <= maxBoundary + tolerance);

  return isAlongContent && nearest.distance <= tolerance;
};
