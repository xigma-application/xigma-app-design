import { CSSProperties } from 'react';

// types
import { TGradientPaint, TImagePaint } from 'types/design/paint/types';

// utils
import { getGradientAngleFromPoints } from 'utils/design/paint/getGradientAngleFromPoints';
import { getGradientPreviewStyle } from 'shared/UITools/ColorPicker/utils/getGradientPreviewStyle';

export const getNonSolidFillSwatchStyle = (paint: TGradientPaint | TImagePaint): CSSProperties => {
  if (paint.type !== 'image') {
    const angle = getGradientAngleFromPoints(paint.start, paint.end);
    const stops = paint.stops.map((stop, index) => ({ ...stop, id: String(index) }));

    return getGradientPreviewStyle(stops, paint.type, angle);
  }

  return { background: '#000000' };
};
