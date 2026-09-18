// types
import { StrokeSides } from 'types/design/enums';
import { TStrokeSidesChange, TStrokeSideSource } from './types';

export const getStrokeWeightChange = (node: TStrokeSideSource, weight: number): TStrokeSidesChange => {
  if (node.strokeSides === StrokeSides.custom) {
    return { strokeBottomWidth: weight, strokeLeftWidth: weight, strokeRightWidth: weight, strokeTopWidth: weight, strokeWidth: weight };
  }

  return { strokeWidth: weight };
};
