export type TImageFillMode = 'crop' | 'fill' | 'fit' | 'tile';

export type TImagePanelState = {
  contrast: number;
  exposure: number;
  fillMode: TImageFillMode;
  highlights: number;
  saturation: number;
  shadows: number;
  temperature: number;
  tint: number;
};
