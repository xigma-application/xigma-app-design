// types
import { TCommitStrokeChanges } from '../types';

export const handleStrokeDashesScrub = (value: number, dashes: number[], update: TCommitStrokeChanges): void => {
  const delta = value - dashes[0];
  const nextDashes = dashes.map((length) => Math.round(Math.max(0, length + delta) * 100) / 100);

  if (nextDashes.some((length) => length > 0)) {
    update({ strokeDashes: nextDashes });
  }
};
