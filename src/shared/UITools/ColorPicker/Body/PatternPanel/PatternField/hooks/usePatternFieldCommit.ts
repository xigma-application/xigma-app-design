import { FocusEvent, KeyboardEvent } from 'react';

// utils
import { clamp } from 'utils/math/clamp';

export type TUsePatternFieldCommitResult = {
  onBlur: TFunc<[FocusEvent<HTMLInputElement>]>;
  onKeyDown: TFunc<[KeyboardEvent<HTMLInputElement>]>;
};

const commitPatternFieldValue = (
  input: HTMLInputElement,
  value: number,
  min: number,
  max: number,
  suffix: string,
  onCommit: TFunc<[number]>,
): void => {
  const rawValue = input.value.replace(suffix, '').trim();
  const parsed = Number(rawValue);

  if (rawValue !== '' && !Number.isNaN(parsed)) {
    onCommit(clamp(parsed, min, max));
  } else {
    input.value = `${value}${suffix}`;
  }
};

export const usePatternFieldCommit = (
  value: number,
  min: number,
  max: number,
  suffix: string,
  onCommit: TFunc<[number]>,
): TUsePatternFieldCommitResult => ({
  onBlur: (event): void => commitPatternFieldValue(event.target, value, min, max, suffix, onCommit),
  onKeyDown: (event): void => {
    if (event.key === 'Enter') {
      commitPatternFieldValue(event.currentTarget, value, min, max, suffix, onCommit);
      event.currentTarget.blur();
    }
  },
});
