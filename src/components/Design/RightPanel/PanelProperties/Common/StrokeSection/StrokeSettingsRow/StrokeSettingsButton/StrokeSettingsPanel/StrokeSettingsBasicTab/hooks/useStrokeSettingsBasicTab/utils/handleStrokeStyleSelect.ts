// types
import { StrokeStyle } from 'types/design/enums';
import { TCommitStrokeChanges } from '../types';

// others
import { STROKE_STYLES } from '../../../constants';

export const handleStrokeStyleSelect = (nextStyle: StrokeStyle, style: StrokeStyle, commit: TCommitStrokeChanges): void => {
  if (STROKE_STYLES.includes(nextStyle) && nextStyle !== style) {
    commit({ strokeStyle: nextStyle });
  }
};
