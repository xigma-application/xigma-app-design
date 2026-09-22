// types
import { TDraftRect, TPoint } from 'types/canvas';

// utils
import { formatSvgNumber } from './formatSvgNumber';
import { getSvgPolygonPathData } from './getSvgPolygonPathData';

export const drawSvgPolygons = (
  elements: string[],
  polygons: TPoint[][],
  color: string,
  opacity: number,
  bounds: TDraftRect,
  fillRule: 'evenodd' | 'nonzero' = 'evenodd',
): void => {
  const data = getSvgPolygonPathData(polygons, bounds);

  if (data) {
    const opacityAttribute = opacity < 1 ? ` fill-opacity="${formatSvgNumber(opacity)}"` : '';
    elements.push(`<path d="${data}" fill="${color}"${opacityAttribute} fill-rule="${fillRule}"/>`);
  }
};
