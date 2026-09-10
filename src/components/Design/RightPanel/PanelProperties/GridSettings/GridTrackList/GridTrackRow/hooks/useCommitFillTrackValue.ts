import { FocusEvent } from 'react';

// utils
import { parseFillFieldInput } from '../utils/parseFillFieldInput';

// types
import { SizingMode } from 'types/design/enums';

export const useCommitFillTrackValue = (
  onChangeMode: (mode: SizingMode, value?: number) => void,
  onChangeValue: TFunc<[number]>,
): TFunc<[FocusEvent<HTMLInputElement>]> => {
  return (event: FocusEvent<HTMLInputElement>): void => {
    const result = parseFillFieldInput(event.target.value);

    if (result.mode === SizingMode.fill) {
      onChangeValue(result.value);
    }

    if (result.mode === SizingMode.fixed) {
      onChangeMode(SizingMode.fixed, result.value);
    }
  };
};
