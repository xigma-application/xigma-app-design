// types
import { TPoint } from 'types/canvas';

export type TPaintType = 'gradient-angular' | 'gradient-linear' | 'gradient-radial' | 'image' | 'solid';

export type TImageScaleMode = 'fill' | 'fit' | 'stretch' | 'tile';

export type TGradientStop = {
  color: string;
  opacity: number;
  position: number;
};

type TPaintBase = {
  opacity: number;
  visible?: boolean;
};

export type TSolidPaint = TPaintBase & {
  color: string;
  type: 'solid';
};

export type TGradientPaint = TPaintBase & {
  end: TPoint;
  start: TPoint;
  stops: TGradientStop[];
  type: 'gradient-angular' | 'gradient-linear' | 'gradient-radial';
};

export type TImagePaint = TPaintBase & {
  ref: string;
  scaleMode: TImageScaleMode;
  type: 'image';
};

export type TPaint = TGradientPaint | TImagePaint | TSolidPaint;
