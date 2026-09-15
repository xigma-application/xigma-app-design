// types
import { TPaint, TPatternPaint } from 'types/design/paint/types';
import { TPatternPanelChange } from 'shared/UITools/ColorPicker/Body/PatternPanel/types';

export const useConvertToPatternPaint = (paint: TPaint, onChange: TFunc<[TPatternPaint]>): TFunc<[TPatternPanelChange]> => {
  return (change: TPatternPanelChange): void => {
    if (paint.type === 'pattern') {
      onChange({
        ...change,
        blendMode: paint.blendMode,
        frozenSourceSnapshot: paint.frozenSourceSnapshot,
        opacity: paint.opacity,
        sourceNodeId: paint.sourceNodeId,
        type: 'pattern',
        visible: paint.visible,
      });
    } else {
      onChange({ ...change, blendMode: paint.blendMode, opacity: paint.opacity, type: 'pattern', visible: paint.visible });
    }
  };
};
