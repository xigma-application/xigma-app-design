// types
import { TGlyphQuadBounds } from '../getGlyphQuadBounds';
import { TPoint } from 'types/canvas';

export type TValueLabelBadgeGeometry = {
  badgeHeight: number;
  badgeWidth: number;
  center: TPoint;
};

export const getValueLabelBadgeGeometry = (
  bounds: TGlyphQuadBounds,
  anchor: TPoint,
  offsetDirection: TPoint,
  paddingX: number,
  paddingY: number,
  defaultOffset: number,
  edgeGapPx: number | undefined,
  zoom: number,
): TValueLabelBadgeGeometry => {
  const badgeWidth = bounds.maxX - bounds.minX + paddingX * 2;
  const badgeHeight = bounds.maxY - bounds.minY + paddingY * 2;
  const offset = edgeGapPx === undefined ? defaultOffset : edgeGapPx / zoom + badgeHeight / 2;
  const center: TPoint = { x: anchor.x + offsetDirection.x * offset, y: anchor.y + offsetDirection.y * offset };

  return { badgeHeight, badgeWidth, center };
};
