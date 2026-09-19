// types
import { TIconProps } from '@xigma/components';

export const STROKE_BRUSH_SECTION_HEIGHT_PX = 44;

export const STROKE_BRUSH_PREVIEW_WIDTH_PX = 144;

export const STROKE_BRUSH_MENU_MAX_HEIGHT_PX = 320;

export const STROKE_BRUSH_DIRECTIONS = ['left', 'right'] as const;

export type TStrokeBrushDirection = (typeof STROKE_BRUSH_DIRECTIONS)[number];

export const STROKE_BRUSH_DIRECTION_ICON: TIconProps['name'] = 'ArrowRight';

export const DEFAULT_STROKE_BRUSH_DIRECTION: TStrokeBrushDirection = 'right';
