// types
import { StrokeBrushDirection } from 'types/design/enums';
import { TApplyStrokeBrushChanges } from '../types';

export const handleStrokeBrushDirectionChange = (
  value: string,
  current: StrokeBrushDirection | undefined,
  commit: TApplyStrokeBrushChanges,
): void => {
  const next = Object.values(StrokeBrushDirection).find((direction) => direction === value);

  if (next && next !== current) {
    commit({ strokeBrushDirection: next });
  }
};
