// types
import { StrokeDashCap } from 'types/design/enums';
import { TCommitStrokeChanges } from '../types';

// others
import { STROKE_DASH_CAPS } from '../../../constants';

export const handleStrokeDashCapSelect = (value: string, dashCap: StrokeDashCap | undefined, commit: TCommitStrokeChanges): void => {
  const nextCap = STROKE_DASH_CAPS.find((option) => option === value);

  if (nextCap && nextCap !== dashCap) {
    commit({ strokeDashCap: nextCap });
  }
};
