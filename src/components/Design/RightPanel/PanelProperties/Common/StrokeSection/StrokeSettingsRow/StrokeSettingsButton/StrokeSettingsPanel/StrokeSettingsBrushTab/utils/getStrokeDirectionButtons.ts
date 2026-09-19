// others
import { STROKE_BRUSH_DIRECTION_ICON, STROKE_BRUSH_DIRECTIONS, TStrokeBrushDirection } from '../constants';

// types
import { StrokeBrushDirection } from 'types/design/enums';
import { TToggleButton } from 'shared/UITools/ToggleButtonGroup/types';

export const getStrokeDirectionButtons = (getLabel: (direction: TStrokeBrushDirection) => string): TToggleButton[] =>
  STROKE_BRUSH_DIRECTIONS.map((direction) => ({
    ariaLabel: getLabel(direction),
    icon: STROKE_BRUSH_DIRECTION_ICON,
    iconFlipped: direction === StrokeBrushDirection.left,
    tooltip: getLabel(direction),
    value: direction,
  }));
