// types
import { TGradientPanelChange } from 'shared/UITools/ColorPicker/Body/GradientPanel/types';
import { TGradientPaint, TSolidPaint } from 'types/design/paint/types';

// utils
import { mapEditableStopsToGradientStops } from 'utils/design/paint/mapEditableStopsToGradientStops';

export const useHandleGradientPaintChange = (
  paint: TGradientPaint,
  onChange: TFunc<[TGradientPaint | TSolidPaint]>,
): TFunc<[TGradientPanelChange]> => {
  return ({ end, start, stops, type }: TGradientPanelChange): void => {
    onChange({ ...paint, end: end ?? paint.end, start: start ?? paint.start, stops: mapEditableStopsToGradientStops(stops), type });
  };
};
