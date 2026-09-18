// types
import { StrokeSides } from 'types/design/enums';
import { TIconProps } from '@xigma/components';

const STROKE_SIDES_ICONS: Record<StrokeSides, TIconProps['name']> = {
  [StrokeSides.all]: 'Stroke',
  [StrokeSides.bottom]: 'StrokeBottom',
  [StrokeSides.custom]: 'Properties',
  [StrokeSides.left]: 'StrokeLeft',
  [StrokeSides.right]: 'StrokeRight',
  [StrokeSides.top]: 'StrokeTop',
};

export const getStrokeSidesIcon = (sides: StrokeSides): TIconProps['name'] => STROKE_SIDES_ICONS[sides];
