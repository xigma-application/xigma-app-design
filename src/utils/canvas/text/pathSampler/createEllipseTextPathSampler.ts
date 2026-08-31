// types
import { TEllipseArcLengthSample } from 'types/canvas';
import { TTextPathBox, TTextPathSampler } from './types';

// utils
import { buildEllipseArcLengthTable } from '../../shapes/buildEllipseArcLengthTable';
import { getEllipseCircumference } from '../../shapes/getEllipseCircumference';
import { getEllipsePathSample } from '../../shapes/getEllipsePathSample';
import { getNearestEllipsePathOffset } from '../../shapes/getNearestEllipsePathOffset/getNearestEllipsePathOffset';
import { getOrBuildEllipseArcLengthTable } from './getOrBuildEllipseArcLengthTable';

export const createEllipseTextPathSampler = (
  box: TTextPathBox,
  ellipseArcLengthCache?: Map<string, TEllipseArcLengthSample[]>,
): TTextPathSampler => {
  const table = ellipseArcLengthCache
    ? getOrBuildEllipseArcLengthTable(ellipseArcLengthCache, box.width, box.height)
    : buildEllipseArcLengthTable(box.width, box.height);

  return {
    cornerLengths: [],
    isClosed: true,
    nearestOffsetAtPoint: (worldPoint) => getNearestEllipsePathOffset(worldPoint, { ...box, rotation: 0 }, table),
    sampleAtLength: (length) => getEllipsePathSample(box.width, box.height, table, length),
    totalLength: getEllipseCircumference(table),
  };
};
