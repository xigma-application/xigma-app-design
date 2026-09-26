// hooks
import { usePatternThumbnail } from 'shared/UITools/ColorPicker/Body/PatternPanel/PatternSourcePreview/hooks/usePatternThumbnail';

// types
import { TPaint } from 'types/design/paint/types';

// utils
import { isColorPaint } from 'utils/design/paint/isColorPaint';

export const usePaintFillThumbnail = (paintFill: TPaint[] | null): string | null => {
  const layer = paintFill?.find((paint) => !isColorPaint(paint));
  const patternThumbnail = usePatternThumbnail(layer?.type === 'pattern' ? layer.sourceNodeId : null);

  return layer && layer.type !== 'pattern' ? layer.ref : patternThumbnail;
};
