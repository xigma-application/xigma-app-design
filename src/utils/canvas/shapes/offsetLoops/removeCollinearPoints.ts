// types
import { TPoint } from 'types/canvas';

const EPSILON = 1e-9;

export const removeCollinearPoints = (loop: TPoint[]): TPoint[] => {
  const distinct = loop.filter((point, index) => {
    const next = loop[(index + 1) % loop.length];
    return Math.hypot(next.x - point.x, next.y - point.y) > EPSILON;
  });

  return distinct.filter((point, index) => {
    const previous = distinct[(index - 1 + distinct.length) % distinct.length];
    const next = distinct[(index + 1) % distinct.length];
    const into = { x: point.x - previous.x, y: point.y - previous.y };
    const out = { x: next.x - point.x, y: next.y - point.y };
    const scale = Math.hypot(into.x, into.y) * Math.hypot(out.x, out.y);

    return Math.abs(into.x * out.y - into.y * out.x) > EPSILON * scale || into.x * out.x + into.y * out.y < 0;
  });
};
