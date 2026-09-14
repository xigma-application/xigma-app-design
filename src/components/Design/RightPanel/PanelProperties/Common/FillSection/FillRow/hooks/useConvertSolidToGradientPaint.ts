// types
import { TGradientPanelChange } from 'shared/UITools/ColorPicker/Body/GradientPanel/types';
import { TGradientPaint, TPaint, TSolidPaint } from 'types/design/paint/types';

// utils
import { getGradientPointsFromAngle } from 'utils/design/paint/getGradientPointsFromAngle';
import { mapEditableStopsToGradientStops } from 'utils/design/paint/mapEditableStopsToGradientStops';

export const useConvertSolidToGradientPaint = (
  paint: TPaint,
  onChange: TFunc<[TGradientPaint | TSolidPaint]>,
): TFunc<[TGradientPanelChange]> => {
  return ({ angle, end, start, stops, type }: TGradientPanelChange): void => {
    const points = start && end ? { end, start } : getGradientPointsFromAngle(angle);
    const radiusRatio = type === 'gradient-radial' ? (paint.type === 'gradient-radial' ? (paint.radiusRatio ?? 1) : 1) : undefined;

    onChange({
      blendMode: paint.blendMode,
      end: points.end,
      opacity: paint.opacity,
      radiusRatio,
      start: points.start,
      stops: mapEditableStopsToGradientStops(stops),
      type,
      visible: paint.visible,
    });
  };
};
