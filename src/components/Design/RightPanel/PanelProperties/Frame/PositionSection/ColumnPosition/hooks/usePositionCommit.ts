import { FocusEvent } from 'react';

export const usePositionCommit =
  (currentValue: number, onCommit: TFunc<[number]>): TFunc<[FocusEvent<HTMLInputElement>]> =>
  (event): void => {
    const raw = event.target.value.trim();
    const parsed = Number(raw);

    if (raw !== '' && !Number.isNaN(parsed)) {
      onCommit(parsed);
    } else {
      event.target.value = String(currentValue);
    }
  };
