import { FocusEvent } from 'react';

// utils
import { clamp } from 'utils/math/clamp';

export const useAlphaCommit =
  (alpha: number, onCommit: TFunc<[number]>): TFunc<[FocusEvent<HTMLInputElement>]> =>
  (event): void => {
    const raw = event.target.value.trim();
    const parsed = Number(raw);

    if (raw !== '' && !Number.isNaN(parsed)) {
      onCommit(clamp(parsed, 0, 100));
    } else {
      event.target.value = String(Math.round(alpha));
    }
  };
