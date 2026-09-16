// types
import { ColorPickerTab } from 'shared/UITools/ColorPicker/enums';
import { TPaint } from 'types/design/paint/types';

export const getFillRowInitialActiveTab = (paint: TPaint): ColorPickerTab | undefined => {
  switch (paint.type) {
    case 'pattern':
      return ColorPickerTab.pattern;
    case 'image':
      return ColorPickerTab.image;
    case 'solid':
      return undefined;
    default:
      return ColorPickerTab.gradient;
  }
};
