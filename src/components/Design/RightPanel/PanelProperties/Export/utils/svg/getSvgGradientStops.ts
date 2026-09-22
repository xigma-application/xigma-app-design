// types
import { TGradientStop } from 'types/design/paint/types';

// utils
import { formatSvgNumber } from './formatSvgNumber';

export const getSvgGradientStops = (stops: TGradientStop[]): string =>
  stops
    .map(
      (stop) =>
        `<stop offset="${formatSvgNumber(stop.position)}" stop-color="${stop.color}" stop-opacity="${formatSvgNumber(stop.opacity / 100)}"/>`,
    )
    .join('');
