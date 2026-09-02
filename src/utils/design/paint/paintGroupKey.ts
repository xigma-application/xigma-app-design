// types
import { TGradientPaint, TPaint } from 'types/design/paint/types';

const gradientKey = (head: string, paint: TGradientPaint): string => {
  const stops = paint.stops.map((stop) => `${stop.position},${stop.color},${stop.opacity}`).join(';');

  return `${head}:${paint.start.x},${paint.start.y}:${paint.end.x},${paint.end.y}:${stops}`;
};

const singlePaintKey = (paint: TPaint): string => {
  const head = `${paint.type}:${paint.opacity}:${paint.visible === false ? 0 : 1}`;

  switch (paint.type) {
    case 'solid':
      return `${head}:${paint.color}`;
    case 'image':
      return `${head}:${paint.ref}:${paint.scaleMode}`;
    default:
      return gradientKey(head, paint);
  }
};

export const paintGroupKey = (paints: TPaint[]): string => paints.map(singlePaintKey).join('|');
