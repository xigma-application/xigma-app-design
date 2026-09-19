import { KeyboardEvent } from 'react';

// utils
import { isValidHex } from 'shared/UITools/ColorPicker/utils/isValidHex';
import { normalizeHex } from 'shared/UITools/ColorPicker/utils/normalizeHex';
import { stepHexValue } from 'shared/UITools/ColorPicker/Body/SolidPanel/ColorValueInput/HexField/utils/stepHexValue';

const ARROW_KEY_DELTA: Record<string, number> = { ArrowDown: -1, ArrowUp: 1 };

export const useHexStepKeyDown =
  (onCommit: TFunc<[string]>): TFunc<[KeyboardEvent<HTMLInputElement>]> =>
  (event): void => {
    const delta = ARROW_KEY_DELTA[event.key];
    const input = event.currentTarget;

    if (delta !== undefined && isValidHex(input.value)) {
      event.preventDefault();
      const stepped = stepHexValue(normalizeHex(input.value).replace('#', ''), input.selectionStart ?? 0, input.selectionEnd ?? 0, delta);

      input.value = stepped.hex;
      input.setSelectionRange(stepped.selectionStart, stepped.selectionEnd);
      onCommit(normalizeHex(stepped.hex));
    }
  };
