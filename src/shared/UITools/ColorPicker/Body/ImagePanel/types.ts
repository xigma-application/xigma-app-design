// types
import { TImageScaleMode } from 'types/design/paint/types';

export type TImageFillMode = 'crop' | 'fill' | 'fit' | 'tile';

export type TImagePanelChange = { ref: string; scaleMode: TImageScaleMode };

export type TImagePanelState = {
  contrast: number;
  exposure: number;
  fillMode: TImageFillMode;
  highlights: number;
  imageUrl: string | null;
  saturation: number;
  shadows: number;
  temperature: number;
  tint: number;
};
