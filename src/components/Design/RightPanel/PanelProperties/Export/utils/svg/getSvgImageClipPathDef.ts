// types
import { TDraftRect, TPoint } from 'types/canvas';

// utils
import { getSvgPolygonPathData } from './getSvgPolygonPathData';

export const getSvgImageClipPathDef = (id: string, polygons: TPoint[][], bounds: TDraftRect): string =>
  `<clipPath id="${id}"><path d="${getSvgPolygonPathData(polygons, bounds)}"/></clipPath>`;
