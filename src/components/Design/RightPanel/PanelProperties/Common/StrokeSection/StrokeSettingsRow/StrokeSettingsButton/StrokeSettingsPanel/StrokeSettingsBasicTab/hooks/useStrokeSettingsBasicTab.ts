import { useState } from 'react';

// others
import { DEFAULT_STROKE_STYLE, TStrokeStyle } from '../constants';

export type TUseStrokeSettingsBasicTabResult = {
  hasDashes: boolean;
  isCustom: boolean;
  isDashed: boolean;
  onStyleSelect: TFunc<[TStrokeStyle]>;
  style: TStrokeStyle;
};

export const useStrokeSettingsBasicTab = (): TUseStrokeSettingsBasicTabResult => {
  const [style, setStyle] = useState<TStrokeStyle>(DEFAULT_STROKE_STYLE);

  return {
    hasDashes: style !== 'solid',
    isCustom: style === 'custom',
    isDashed: style === 'dashed',
    onStyleSelect: (nextStyle: TStrokeStyle): void => setStyle(nextStyle),
    style,
  };
};
