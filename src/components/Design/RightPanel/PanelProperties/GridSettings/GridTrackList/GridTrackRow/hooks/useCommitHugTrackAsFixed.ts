import { FocusEvent } from 'react';

// types
import { SizingMode } from 'types/design/enums';

export const useCommitHugTrackAsFixed = (
  onChangeMode: (mode: SizingMode, value?: number) => void,
): TFunc<[FocusEvent<HTMLInputElement>]> => {
  return (event: FocusEvent<HTMLInputElement>): void => {
    const parsed = parseFloat(event.target.value);

    if (!Number.isNaN(parsed)) {
      onChangeMode(SizingMode.fixed, parsed);
    }
  };
};
