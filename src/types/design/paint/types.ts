// types
import { BlendMode } from 'types/design/enums';
import { TPoint } from 'types/canvas';
import { TSceneNode } from 'types/design/types';

export type TPaintType = 'gradient-angular' | 'gradient-diamond' | 'gradient-linear' | 'gradient-radial' | 'image' | 'pattern' | 'solid';

export type TImageScaleMode = 'fill' | 'fit' | 'stretch' | 'tile';

export type TPatternDirection = 'horizontal' | 'vertical';

export type TPatternTileType = 'hexagonal' | 'rectangular';

export type TGradientStop = {
  color: string;
  opacity: number;
  position: number;
};

type TPaintBase = {
  blendMode?: BlendMode;
  opacity: number;
  visible?: boolean;
};

export type TSolidPaint = TPaintBase & {
  color: string;
  type: 'solid';
};

export type TGradientPaint = TPaintBase & {
  end: TPoint;
  radiusRatio?: number;
  start: TPoint;
  stops: TGradientStop[];
  type: 'gradient-angular' | 'gradient-diamond' | 'gradient-linear' | 'gradient-radial';
};

export type TImageCrop = {
  height: number;
  rotation: number;
  width: number;
  x: number;
  y: number;
};

export type TImagePaint = TPaintBase & {
  crop?: TImageCrop;
  ref: string;
  rotation: number;
  scaleMode: TImageScaleMode;
  type: 'image';
};

export type TPatternPaint = TPaintBase & {
  alignmentIndex: number;
  direction: TPatternDirection;
  frozenSourceSnapshot?: TSceneNode[] | null;
  offsetX: number;
  offsetY: number;
  scale: number;
  sourceNodeId?: string | null;
  spacingX: number;
  spacingY: number;
  tileType: TPatternTileType;
  type: 'pattern';
};

export type TPaint = TGradientPaint | TImagePaint | TPatternPaint | TSolidPaint;
