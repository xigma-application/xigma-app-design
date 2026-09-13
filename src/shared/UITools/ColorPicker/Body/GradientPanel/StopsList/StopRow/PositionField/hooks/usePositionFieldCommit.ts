import { FocusEvent, KeyboardEvent } from 'react';

// utils
import { clamp } from 'utils/math/clamp';

export type TUsePositionFieldCommitResult = {
  onBlur: TFunc<[FocusEvent<HTMLInputElement>]>;
  onKeyDown: TFunc<[KeyboardEvent<HTMLInputElement>]>;
};

const commitPositionValue = (input: HTMLInputElement, positionPercent: number, onCommit: TFunc<[number]>): void => {
  const rawValue = input.value.replace('%', '').trim();
  const parsed = Number(rawValue);

  if (rawValue !== '' && !Number.isNaN(parsed)) {
    onCommit(clamp(parsed, 0, 100));
  } else {
    input.value = `${Math.round(positionPercent)}%`;
  }
};

export const usePositionFieldCommit = (positionPercent: number, onCommit: TFunc<[number]>): TUsePositionFieldCommitResult => ({
  onBlur: (event): void => commitPositionValue(event.target, positionPercent, onCommit),
  onKeyDown: (event): void => {
    if (event.key === 'Enter') {
      commitPositionValue(event.currentTarget, positionPercent, onCommit);
      event.currentTarget.blur();
    }
  },
});
