// types
import { TPoint } from 'types/canvas';
import { TSvgGradientGeometry } from './getSvgGradientGeometry';

export const getSvgAngularGradientPoint = (geometry: TSvgGradientGeometry, radiusRatio: number, reach: number, angle: number): TPoint => ({
  x: geometry.start.x + reach * Math.cos(angle) * geometry.direction.x + reach * Math.sin(angle) * radiusRatio * geometry.perpendicular.x,
  y: geometry.start.y + reach * Math.cos(angle) * geometry.direction.y + reach * Math.sin(angle) * radiusRatio * geometry.perpendicular.y,
});
