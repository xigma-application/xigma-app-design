// types
import { TGradientPanelChange } from 'shared/UITools/ColorPicker/Body/GradientPanel/types';
import { TGradientPaint, TPaint, TSolidPaint } from 'types/design/paint/types';

// utils
import { getGradientPointsFromAngle } from 'utils/design/paint/getGradientPointsFromAngle';
import { mapEditableStopsToGradientStops } from 'utils/design/paint/mapEditableStopsToGradientStops';

const RADIUS_RATIO_GRADIENT_TYPES = new Set(['gradient-angular', 'gradient-diamond', 'gradient-radial']);

const isRadiusRatioGradientType = (type: TPaint['type']): boolean => RADIUS_RATIO_GRADIENT_TYPES.has(type);

const isRadiusRatioGradientPaint = (paint: TPaint): paint is TGradientPaint => RADIUS_RATIO_GRADIENT_TYPES.has(paint.type);

const getConvertedRadiusRatio = (type: TPaint['type'], paint: TPaint): number | undefined => {
  if (isRadiusRatioGradientType(type)) {
    if (isRadiusRatioGradientPaint(paint)) {
      return paint.radiusRatio ?? 1;
    }

    return 1;
  }

  return undefined;
};

export const useConvertSolidToGradientPaint = (
  paint: TPaint,
  onChange: TFunc<[TGradientPaint | TSolidPaint]>,
): TFunc<[TGradientPanelChange]> => {
  return ({ angle, end, start, stops, type }: TGradientPanelChange): void => {
    const points = start && end ? { end, start } : getGradientPointsFromAngle(angle);
    const radiusRatio = getConvertedRadiusRatio(type, paint);

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
