// types
import { StrokeAlign, StrokeMode, StrokeSides } from 'types/design/enums';
import { TStrokeSidesChange, TStrokeSideSource } from './types';

// utils
import { getStrokeSidesChange } from './getStrokeSidesChange';

export type TStrokeModeChange = TStrokeSidesChange & { strokeAlign?: StrokeAlign; strokeMode: StrokeMode };

export const getStrokeModeChange = (node: TStrokeSideSource, mode: StrokeMode): TStrokeModeChange => {
  const align = mode === StrokeMode.dynamic ? { strokeAlign: StrokeAlign.center } : {};

  if (mode !== StrokeMode.basic && (node.strokeSides ?? StrokeSides.all) !== StrokeSides.all) {
    return { ...getStrokeSidesChange(node, StrokeSides.all), ...align, strokeMode: mode };
  }

  return { ...align, strokeMode: mode };
};
