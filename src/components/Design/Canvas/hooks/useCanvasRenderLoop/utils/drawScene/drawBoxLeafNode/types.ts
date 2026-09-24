// types
import { TRectangleNode } from 'types/design/types';

export type TProgressiveBlurUniforms = {
  line: [number, number, number, number];
  radii: [number, number];
};

export type TBoxPaintsBounds = Pick<TRectangleNode, 'height' | 'rotation' | 'width' | 'x' | 'y'>;
