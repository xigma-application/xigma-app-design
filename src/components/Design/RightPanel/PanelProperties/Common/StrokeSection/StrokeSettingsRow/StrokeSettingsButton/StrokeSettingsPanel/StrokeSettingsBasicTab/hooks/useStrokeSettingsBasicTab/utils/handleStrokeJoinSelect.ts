// types
import { StrokeJoin } from 'types/design/enums';
import { TCommitStrokeChanges } from '../types';

// others
import { STROKE_JOINS } from '../../../constants';

export const handleStrokeJoinSelect = (value: string, join: StrokeJoin, commit: TCommitStrokeChanges): void => {
  const nextJoin = STROKE_JOINS.find((option) => option === value);

  if (nextJoin && nextJoin !== join) {
    commit({ strokeJoin: nextJoin });
  }
};
