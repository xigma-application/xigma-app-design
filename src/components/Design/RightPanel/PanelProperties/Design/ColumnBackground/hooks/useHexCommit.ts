import { FocusEvent } from 'react';

// utils
import { isValidHex } from 'shared/UITools/ColorPicker/utils/isValidHex';
import { normalizeHex } from 'shared/UITools/ColorPicker/utils/normalizeHex';

export const useHexCommit =
  (hex: string, onCommit: TFunc<[string]>): TFunc<[FocusEvent<HTMLInputElement>]> =>
  (event): void => {
    if (isValidHex(event.target.value)) {
      onCommit(normalizeHex(event.target.value));
    } else {
      event.target.value = hex.replace('#', '');
    }
  };
