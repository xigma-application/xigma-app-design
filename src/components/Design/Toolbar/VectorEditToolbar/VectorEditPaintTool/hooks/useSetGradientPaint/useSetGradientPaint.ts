// store
import { selectPaint } from 'store/design/selectors';
import { setPaint } from 'store/design/slice';
import { useAppDispatch, useAppSelector } from 'store';

// types
import { TGradientPanelChange } from 'shared/UITools/ColorPicker/Body/GradientPanel/types';

// utils
import { getGradientPointsFromAngle } from 'utils/design/paint/getGradientPointsFromAngle';
import { mapEditableStopsToGradientStops } from 'utils/design/paint/mapEditableStopsToGradientStops';

export const useSetGradientPaint = (): TFunc<[TGradientPanelChange]> => {
  const dispatch = useAppDispatch();
  const paint = useAppSelector(selectPaint);

  return ({ angle, stops, type }: TGradientPanelChange): void => {
    const { end, start } = getGradientPointsFromAngle(angle);

    dispatch(
      setPaint({
        blendMode: paint.blendMode,
        end,
        opacity: 100,
        start,
        stops: mapEditableStopsToGradientStops(stops),
        type,
      }),
    );
  };
};

export default useSetGradientPaint;
