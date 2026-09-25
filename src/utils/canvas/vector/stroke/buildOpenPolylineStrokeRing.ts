// types
import { TPoint } from 'types/canvas';
import { TStrokeRing } from 'components/Design/Canvas/hooks/useCanvasRenderLoop/utils/drawScene/types';

// utils
import { getStrokeOutlinePolygons } from 'utils/canvas/vectorNetwork/getStrokeOutlinePolygons/getStrokeOutlinePolygons';

const getLengths = (mids: TPoint[]): number[] =>
  mids.map((point, index) => (index < mids.length - 1 ? Math.hypot(mids[index + 1].x - point.x, mids[index + 1].y - point.y) : 0));

export const buildOpenPolylineStrokeRing = (points: TPoint[], halfWidth: number): TStrokeRing => {
  const band = getStrokeOutlinePolygons(points, halfWidth, false).outer;
  const outer = band.slice(0, band.length / 2);
  const inner = band.slice(band.length / 2).reverse();
  const mids = outer.map((point, index) => ({ x: (point.x + inner[index].x) / 2, y: (point.y + inner[index].y) / 2 }));
  const lengths = getLengths(mids);
  const cumulative = lengths.map((_, index) => lengths.slice(0, index).reduce((total, length) => total + length, 0));

  return { closed: false, cumulative, inner, lengths, mids, outer, perimeter: lengths.reduce((total, length) => total + length, 0) };
};
