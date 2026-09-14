// types
import { TPaint, TPatternPaint } from 'types/design/paint/types';
import { TPatternPanelChange } from 'shared/UITools/ColorPicker/Body/PatternPanel/types';

export const useConvertToPatternPaint = (paint: TPaint, onChange: TFunc<[TPatternPaint]>): TFunc<[TPatternPanelChange]> => {
  return (change: TPatternPanelChange): void => {
    onChange({ ...change, blendMode: paint.blendMode, opacity: paint.opacity, type: 'pattern', visible: paint.visible });
  };
};
