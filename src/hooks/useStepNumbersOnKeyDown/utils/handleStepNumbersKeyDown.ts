import { KeyboardEvent } from 'react';

// types
import { TStepNumbersOnKeyDownOptions } from '../types';

// utils
import { stepNumbersInText } from 'utils/text/stepNumbersInText';

const ARROW_DIRECTION: Record<string, number> = { ArrowDown: -1, ArrowUp: 1 };

export const handleStepNumbersKeyDown = (
  event: KeyboardEvent<HTMLInputElement>,
  { max, min, onStep, shiftStep = 10, step = 1 }: TStepNumbersOnKeyDownOptions,
): void => {
  const direction = ARROW_DIRECTION[event.key];

  if (direction !== undefined) {
    const input = event.currentTarget;
    const stepped = stepNumbersInText(input.value, input.selectionStart ?? 0, input.selectionEnd ?? 0, direction * (event.shiftKey ? shiftStep : step), {
      max,
      min,
    });

    event.preventDefault();

    if (stepped) {
      input.value = stepped.text;
      if (input.selectionStart !== null) {
        input.setSelectionRange(stepped.selectionStart, stepped.selectionEnd);
      }

      onStep?.(stepped.text, event);
    }
  }
};
