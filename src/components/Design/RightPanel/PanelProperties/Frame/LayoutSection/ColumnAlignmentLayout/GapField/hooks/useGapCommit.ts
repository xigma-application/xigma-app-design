import { FocusEvent } from 'react';

export const useGapCommit =
  (isAuto: boolean, autoLabel: string, value: number, onCommit: TFunc<[number]>): TFunc<[FocusEvent<HTMLInputElement>]> =>
  (event): void => {
    const raw = event.target.value.trim();
    const parsed = Number(raw);

    if (raw !== '' && !Number.isNaN(parsed)) {
      onCommit(parsed);
    } else {
      event.target.value = isAuto ? autoLabel : String(value);
    }
  };
