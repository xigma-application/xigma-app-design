// types
import { StrokeSides } from 'types/design/enums';
import { TStrokeSide, TStrokeSidesChange, TStrokeSideSource } from 'utils/design/stroke/types';

// utils
import { getStrokeSideWidthChange } from 'utils/design/stroke/getStrokeSideWidthChange';
import { getStrokeSidesChange } from 'utils/design/stroke/getStrokeSidesChange';

export const getStrokeSideEditChange = (node: TStrokeSideSource, side: TStrokeSide, width: number): TStrokeSidesChange => {
  const sidesChange = node.strokeSides === StrokeSides.custom ? {} : getStrokeSidesChange(node, StrokeSides.custom);
  return { ...sidesChange, ...getStrokeSideWidthChange({ ...node, ...sidesChange }, side, width) };
};
