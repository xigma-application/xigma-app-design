import { FocusEvent } from 'react';

export const useDimensionsCommit =
  (
    displayValue: number | string,
    onCommit: TFunc<[number]>,
    getCommittedDisplayValue?: () => number | string,
  ): TFunc<[FocusEvent<HTMLInputElement>]> =>
  (event): void => {
    const raw = event.target.value.trim();
    const parsed = Number(raw);

    if (raw !== '' && !Number.isNaN(parsed)) {
      onCommit(parsed);

      if (getCommittedDisplayValue) {
        event.target.value = String(getCommittedDisplayValue());
      }
    } else {
      event.target.value = String(displayValue);
    }
  };
