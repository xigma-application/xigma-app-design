// types
import { TEllipseArcLengthSample } from 'types/canvas';

// utils
import { buildEllipseArcLengthTable } from '../../shapes/buildEllipseArcLengthTable';

export const getOrBuildEllipseArcLengthTable = (
  ellipseArcLengthCache: Map<string, TEllipseArcLengthSample[]>,
  width: number,
  height: number,
): TEllipseArcLengthSample[] => {
  const tableKey = `${width}:${height}`;
  const cachedTable = ellipseArcLengthCache.get(tableKey);
  const table = cachedTable ?? buildEllipseArcLengthTable(width, height);

  if (!cachedTable) {
    ellipseArcLengthCache.set(tableKey, table);
  }

  return table;
};
