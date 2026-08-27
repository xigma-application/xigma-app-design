import { FocusEvent, KeyboardEvent } from 'react';

// utils
import { clamp } from 'utils/math/clamp';

export type TUseAlphaFieldCommitResult = {
  onBlur: TFunc<[FocusEvent<HTMLInputElement>]>;
  onKeyDown: TFunc<[KeyboardEvent<HTMLInputElement>]>;
};

const commitAlphaValue = (input: HTMLInputElement, alpha: number, onCommit: TFunc<[number]>): void => {
  const rawValue = input.value.trim();
  const parsed = Number(rawValue);

  if (rawValue !== '' && !Number.isNaN(parsed)) {
    onCommit(clamp(parsed, 0, 100));
  } else {
    input.value = String(Math.round(alpha));
  }
};

export const useAlphaFieldCommit = (alpha: number, onCommit: TFunc<[number]>): TUseAlphaFieldCommitResult => ({
  onBlur: (event): void => commitAlphaValue(event.target, alpha, onCommit),
  onKeyDown: (event): void => {
    if (event.key === 'Enter') {
      commitAlphaValue(event.currentTarget, alpha, onCommit);
      event.currentTarget.blur();
    }
  },
});
