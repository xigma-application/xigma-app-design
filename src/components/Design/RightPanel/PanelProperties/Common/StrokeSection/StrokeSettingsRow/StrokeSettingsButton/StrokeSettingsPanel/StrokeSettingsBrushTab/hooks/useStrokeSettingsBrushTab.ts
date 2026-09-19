import { useState } from 'react';

// @xigma
import { BRUSH_CATEGORIES } from '@xigma/utils';

// others
import { DEFAULT_STROKE_BRUSH_DIRECTION, TStrokeBrushDirection } from '../constants';

export type TUseStrokeSettingsBrushTabResult = {
  brush: string;
  direction: TStrokeBrushDirection;
  onBrushSelect: TFunc<[string]>;
  onDirectionChange: TFunc<[string]>;
};

export const useStrokeSettingsBrushTab = (): TUseStrokeSettingsBrushTabResult => {
  const [brush, setBrush] = useState(BRUSH_CATEGORIES[0].brushes[0].id);
  const [direction, setDirection] = useState<TStrokeBrushDirection>(DEFAULT_STROKE_BRUSH_DIRECTION);

  return {
    brush,
    direction,
    onBrushSelect: (nextBrush: string): void => setBrush(nextBrush),
    onDirectionChange: (nextDirection: string): void => setDirection(nextDirection as TStrokeBrushDirection),
  };
};
