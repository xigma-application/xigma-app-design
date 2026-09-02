// others
import { GUIDE_IDLE_ALPHA, GUIDE_SELECTED_STROKE, GUIDE_STROKE } from 'constant/canvas';

// types
import { TGuideLine } from 'types/design/guides/types';

export type TGuideStyle = {
  alpha: number;
  color: string;
};

export const getGuideStyle = (guide: TGuideLine, isActive: boolean, hoveredId: string | null, selectedId: string | null): TGuideStyle => {
  switch (true) {
    case guide.id === selectedId:
      return { alpha: 1, color: GUIDE_SELECTED_STROKE };
    case isActive || guide.id === hoveredId:
      return { alpha: 1, color: GUIDE_STROKE };
    default:
      return { alpha: GUIDE_IDLE_ALPHA, color: GUIDE_STROKE };
  }
};
