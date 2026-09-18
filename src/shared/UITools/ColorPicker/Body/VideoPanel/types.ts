// types
import { TImageFillMode } from '../ImagePanel/types';
import { TImageScaleMode } from 'types/design/paint/types';

export type TVideoPanelChange = { ref: string; scaleMode: TImageScaleMode };

export type TVideoPanelState = {
  fillMode: TImageFillMode;
  videoSrcUrl: string | null;
  videoUrl: string | null;
};
