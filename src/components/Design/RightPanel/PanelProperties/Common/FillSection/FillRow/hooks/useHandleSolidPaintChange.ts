// types
import { TColorPickerValue } from 'shared/UITools/ColorPicker/types';
import { TGradientPaint, TPaint, TSolidPaint } from 'types/design/paint/types';

export const useHandleSolidPaintChange = (paint: TPaint, onChange: TFunc<[TGradientPaint | TSolidPaint]>): TFunc<[TColorPickerValue]> => {
  return ({ alpha, hex }: TColorPickerValue): void => {
    onChange({ blendMode: paint.blendMode, color: hex, opacity: alpha, type: 'solid', visible: paint.visible });
  };
};
