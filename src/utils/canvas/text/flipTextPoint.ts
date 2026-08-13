// types
import { TPoint } from 'types/canvas';
import { TTextNode } from 'types/design/types';

export const flipTextPoint = (point: TPoint, node: TTextNode): TPoint => ({
  x: node.flipX ? 2 * node.x + node.width - point.x : point.x,
  y: node.flipY ? 2 * node.y + node.height - point.y : point.y,
});
