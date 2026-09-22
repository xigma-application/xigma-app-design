// types
import { TGradientStop } from 'types/design/paint/types';
import { TSvgGradientGeometry } from './getSvgGradientGeometry';

// utils
import { formatSvgNumber } from './formatSvgNumber';
import { getSvgGradientStops } from './getSvgGradientStops';

export const getSvgLinearGradientDef = (id: string, stops: TGradientStop[], geometry: TSvgGradientGeometry): string =>
  `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${formatSvgNumber(geometry.start.x)}" y1="${formatSvgNumber(
    geometry.start.y,
  )}" x2="${formatSvgNumber(geometry.end.x)}" y2="${formatSvgNumber(geometry.end.y)}">${getSvgGradientStops(stops)}</linearGradient>`;
