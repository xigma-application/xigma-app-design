// types
import { TRgba } from 'types/color';

export type TColorPixelSampler = (clientX: number, clientY: number) => Promise<TRgba[] | null>;

export type TColorSampleRequest = {
  onSample: TFunc<[TRgba[]]>;
  x: number;
  y: number;
};
