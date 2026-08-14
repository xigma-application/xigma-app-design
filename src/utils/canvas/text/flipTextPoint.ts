// types
import { TPoint } from 'types/canvas';
import { TTextNode } from 'types/design/types';

export type TFlippableBox = Pick<TTextNode, 'flipX' | 'flipY' | 'height' | 'width' | 'x' | 'y'>;

export const flipTextPoint = (point: TPoint, node: TFlippableBox): TPoint => ({
  x: node.flipX ? 2 * node.x + node.width - point.x : point.x,
  y: node.flipY ? 2 * node.y + node.height - point.y : point.y,
});
