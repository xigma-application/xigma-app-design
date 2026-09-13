// types
import { TEditableGradientStop } from 'shared/UITools/ColorPicker/Body/GradientPanel/types';
import { TGradientStop } from 'types/design/paint/types';

export const mapEditableStopsToGradientStops = (stops: TEditableGradientStop[]): TGradientStop[] =>
  stops.map(({ color, opacity, position }) => ({ color, opacity, position }));
