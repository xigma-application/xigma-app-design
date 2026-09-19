// types
import { TIconProps } from '@xigma/components';
import { StrokeBrushDirection } from 'types/design/enums';

// others
import {
  STROKE_BRUSH_ANGULAR_JITTER_MAX,
  STROKE_BRUSH_ANGULAR_JITTER_MIN,
  STROKE_BRUSH_GAP_MIN,
  STROKE_BRUSH_ROTATION_MAX,
  STROKE_BRUSH_ROTATION_MIN,
  STROKE_BRUSH_SIZE_JITTER_MAX,
  STROKE_BRUSH_SIZE_JITTER_MIN,
  STROKE_BRUSH_WIGGLE_MIN,
} from 'constant/strokeBrush';

export const STROKE_BRUSH_SECTION_HEIGHT_PX = 44;

export const STROKE_BRUSH_TRIGGER_PREVIEW_HEIGHT_PX = 20;

export const STROKE_BRUSH_DIRECTIONS = [StrokeBrushDirection.left, StrokeBrushDirection.right] as const;

export type TStrokeBrushDirection = StrokeBrushDirection;

export const STROKE_BRUSH_DIRECTION_ICON: TIconProps['name'] = 'ArrowRight';

export const STROKE_SCATTER_BRUSH_FIELDS = ['gap', 'wiggle', 'sizeJitter', 'angularJitter', 'rotation'] as const;

export type TStrokeScatterBrushField = (typeof STROKE_SCATTER_BRUSH_FIELDS)[number];

export const STROKE_SCATTER_BRUSH_FIELD_ICONS: Partial<Record<TStrokeScatterBrushField, TIconProps['name']>> = {
  angularJitter: 'AngularJitter',
  rotation: 'Protractor',
  sizeJitter: 'SizeJitter',
  wiggle: 'Wiggle',
};

export const STROKE_SCATTER_BRUSH_LIMITS = {
  angularJitter: {
    max: STROKE_BRUSH_ANGULAR_JITTER_MAX,
    min: STROKE_BRUSH_ANGULAR_JITTER_MIN,
    nodeKey: 'strokeBrushAngularJitter',
    unit: '°',
  },
  gap: { max: undefined, min: STROKE_BRUSH_GAP_MIN, nodeKey: 'strokeBrushGap', unit: '%' },
  rotation: { max: STROKE_BRUSH_ROTATION_MAX, min: STROKE_BRUSH_ROTATION_MIN, nodeKey: 'strokeBrushRotation', unit: '°' },
  sizeJitter: { max: STROKE_BRUSH_SIZE_JITTER_MAX, min: STROKE_BRUSH_SIZE_JITTER_MIN, nodeKey: 'strokeBrushSizeJitter', unit: '%' },
  wiggle: { max: undefined, min: STROKE_BRUSH_WIGGLE_MIN, nodeKey: 'strokeBrushWiggle', unit: '%' },
} as const;
