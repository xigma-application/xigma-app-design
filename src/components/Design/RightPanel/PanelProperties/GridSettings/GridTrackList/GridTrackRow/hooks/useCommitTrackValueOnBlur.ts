import { FocusEvent } from 'react';

export const useCommitTrackValueOnBlur = (onChangeValue: TFunc<[number]>): TFunc<[FocusEvent<HTMLInputElement>]> => {
  return (event: FocusEvent<HTMLInputElement>): void => {
    const parsed = parseFloat(event.target.value);

    if (!Number.isNaN(parsed)) {
      onChangeValue(parsed);
    }
  };
};
