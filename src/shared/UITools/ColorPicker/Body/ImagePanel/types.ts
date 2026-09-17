// types
import { TImageScaleMode } from 'types/design/paint/types';

export type TImageFillMode = 'crop' | 'fill' | 'fit' | 'tile';

export type TImagePanelChange = { ref: string; scaleMode: TImageScaleMode };

export type TImagePanelState = {
  fillMode: TImageFillMode;
  imageUrl: string | null;
};
