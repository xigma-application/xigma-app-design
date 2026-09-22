// types
import { TGradientStop } from 'types/design/paint/types';
import { TSvgGradientGeometry } from './getSvgGradientGeometry';

// utils
import { formatSvgNumber } from './formatSvgNumber';
import { getSvgGradientStops } from './getSvgGradientStops';

export const getSvgRadialGradientDef = (id: string, stops: TGradientStop[], geometry: TSvgGradientGeometry, radiusRatio = 1): string => {
  const matrix = [
    geometry.direction.x * geometry.primaryRadius,
    geometry.direction.y * geometry.primaryRadius,
    geometry.perpendicular.x * geometry.primaryRadius * radiusRatio,
    geometry.perpendicular.y * geometry.primaryRadius * radiusRatio,
    geometry.start.x,
    geometry.start.y,
  ]
    .map(formatSvgNumber)
    .join(' ');

  return `<radialGradient id="${id}" gradientUnits="userSpaceOnUse" cx="0" cy="0" r="1" gradientTransform="matrix(${matrix})">${getSvgGradientStops(
    stops,
  )}</radialGradient>`;
};
