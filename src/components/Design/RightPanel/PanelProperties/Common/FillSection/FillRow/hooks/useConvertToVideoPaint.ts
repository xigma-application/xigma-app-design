// types
import { TPaint, TVideoPaint } from 'types/design/paint/types';
import { TVideoPanelChange } from 'shared/UITools/ColorPicker/Body/VideoPanel/types';

export const useConvertToVideoPaint = (paint: TPaint, onChange: TFunc<[TVideoPaint]>): TFunc<[TVideoPanelChange]> => {
  return (change: TVideoPanelChange): void => {
    if (paint.type === 'video') {
      onChange({ ...paint, ...change });
    } else {
      onChange({ ...change, blendMode: paint.blendMode, opacity: paint.opacity, rotation: 0, type: 'video', visible: paint.visible });
    }
  };
};
