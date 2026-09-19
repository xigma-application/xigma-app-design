// types
import { StrokeMode, StrokeSides } from 'types/design/enums';
import { TStrokeSidesChange, TStrokeSideSource } from './types';

// utils
import { getStrokeSidesChange } from './getStrokeSidesChange';

export type TStrokeModeChange = TStrokeSidesChange & { strokeMode: StrokeMode };

export const getStrokeModeChange = (node: TStrokeSideSource, mode: StrokeMode): TStrokeModeChange => {
  if (mode !== StrokeMode.basic && (node.strokeSides ?? StrokeSides.all) !== StrokeSides.all) {
    return { ...getStrokeSidesChange(node, StrokeSides.all), strokeMode: mode };
  }

  return { strokeMode: mode };
};
