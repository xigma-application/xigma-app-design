// types
import { TPoint } from 'types/canvas';
import { TSvgGradientGeometry } from './getSvgGradientGeometry';

export const getSvgDiamondGradientPolygon = (geometry: TSvgGradientGeometry, radiusRatio: number, distance: number): TPoint[] => {
  const radial = distance * geometry.primaryRadius;
  const tangential = distance * geometry.primaryRadius * radiusRatio;

  return [
    { x: geometry.start.x + radial * geometry.direction.x, y: geometry.start.y + radial * geometry.direction.y },
    { x: geometry.start.x + tangential * geometry.perpendicular.x, y: geometry.start.y + tangential * geometry.perpendicular.y },
    { x: geometry.start.x - radial * geometry.direction.x, y: geometry.start.y - radial * geometry.direction.y },
    { x: geometry.start.x - tangential * geometry.perpendicular.x, y: geometry.start.y - tangential * geometry.perpendicular.y },
  ];
};
