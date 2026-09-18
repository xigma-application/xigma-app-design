// types
import { StrokeSides } from 'types/design/enums';
import { TIconProps } from '@xigma/components';

// utils
import { getStrokeSidesIcon } from './getStrokeSidesIcon';

export const getStrokeSidesTriggerIcon = (sides: StrokeSides): TIconProps['name'] =>
  sides === StrokeSides.custom ? getStrokeSidesIcon(StrokeSides.all) : getStrokeSidesIcon(sides);
