import { FocusEvent, KeyboardEvent } from 'react';

// utils
import { clamp } from 'utils/math/clamp';

export type TUseChannelFieldCommitResult = {
  onBlur: (key: string, max: number) => TFunc<[FocusEvent<HTMLInputElement>]>;
  onKeyDown: (key: string, max: number) => TFunc<[KeyboardEvent<HTMLInputElement>]>;
};

const commitChannelValue = (
  input: HTMLInputElement,
  key: string,
  max: number,
  values: Record<string, number>,
  onCommit: TFunc<[Record<string, number>]>,
): void => {
  const rawValue = input.value.trim();
  const parsed = Number(rawValue);

  if (rawValue !== '' && !Number.isNaN(parsed)) {
    onCommit({ ...values, [key]: clamp(parsed, 0, max) });
  } else {
    input.value = String(Math.round(values[key]));
  }
};

export const useChannelFieldCommit = (
  values: Record<string, number>,
  onCommit: TFunc<[Record<string, number>]>,
): TUseChannelFieldCommitResult => ({
  onBlur: (key, max) => (event) => commitChannelValue(event.target, key, max, values, onCommit),
  onKeyDown: (key, max) => (event) => {
    if (event.key === 'Enter') {
      commitChannelValue(event.currentTarget, key, max, values, onCommit);
      event.currentTarget.blur();
    }
  },
});
