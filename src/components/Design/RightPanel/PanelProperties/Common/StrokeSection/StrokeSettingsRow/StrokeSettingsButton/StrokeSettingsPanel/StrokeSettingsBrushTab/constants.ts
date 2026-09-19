// types
import { TIconProps } from '@xigma/components';

export const STROKE_BRUSH_SECTION_HEIGHT_PX = 44;

export const STROKE_BRUSH_TRIGGER_PREVIEW_HEIGHT_PX = 20;

export const STROKE_BRUSH_DIRECTIONS = ['left', 'right'] as const;

export type TStrokeBrushDirection = (typeof STROKE_BRUSH_DIRECTIONS)[number];

export const STROKE_BRUSH_DIRECTION_ICON: TIconProps['name'] = 'ArrowRight';

export const DEFAULT_STROKE_BRUSH_DIRECTION: TStrokeBrushDirection = 'right';

export const STROKE_SCATTER_BRUSH_FIELDS = ['gap', 'wiggle', 'sizeJitter', 'angularJitter', 'rotation'] as const;

export type TStrokeScatterBrushField = (typeof STROKE_SCATTER_BRUSH_FIELDS)[number];

export const STROKE_SCATTER_BRUSH_FIELD_ICONS: Partial<Record<TStrokeScatterBrushField, TIconProps['name']>> = {
  angularJitter: 'AngularJitter',
  rotation: 'Protractor',
  sizeJitter: 'SizeJitter',
  wiggle: 'Wiggle',
};

export const DEFAULT_STROKE_SCATTER_BRUSH_VALUES: Record<TStrokeScatterBrushField, string> = {
  angularJitter: '180°',
  gap: '45%',
  rotation: '179°',
  sizeJitter: '0%',
  wiggle: '0%',
};
