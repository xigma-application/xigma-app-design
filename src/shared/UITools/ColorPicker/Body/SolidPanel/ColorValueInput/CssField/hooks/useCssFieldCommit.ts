import { FocusEvent, KeyboardEvent, useRef } from 'react';

// types
import { TColorPickerValue } from '../../../../../types';

// utils
import { parseCssColor } from '../utils/parseCssColor';
import { stepCssValue } from '../utils/stepCssValue';

export type TUseCssFieldCommitResult = {
  inputRef: TFunc<[HTMLInputElement | null]>;
  onBlur: TFunc<[FocusEvent<HTMLInputElement>]>;
  onKeyDown: TFunc<[KeyboardEvent<HTMLInputElement>]>;
};

type TPendingSelection = { end: number; start: number };

const ARROW_KEY_DELTA: Record<string, number> = { ArrowDown: -1, ArrowUp: 1 };

const commitCssValue = (input: HTMLInputElement, value: string, onCommit: TFunc<[TColorPickerValue]>): void => {
  const parsedValue = parseCssColor(input.value);

  if (parsedValue) {
    onCommit(parsedValue);
  } else {
    input.value = value;
  }
};

const focusPendingSelection = (node: HTMLInputElement, pendingSelectionRef: { current: TPendingSelection | null }): void => {
  const pendingSelection = pendingSelectionRef.current;

  if (pendingSelection) {
    node.focus();
    node.setSelectionRange(pendingSelection.start, pendingSelection.end);
    pendingSelectionRef.current = null;
  }
};

export const useCssFieldCommit = (value: string, onCommit: TFunc<[TColorPickerValue]>): TUseCssFieldCommitResult => {
  const pendingSelectionRef = useRef<TPendingSelection | null>(null);

  const handleArrowKey = (event: KeyboardEvent<HTMLInputElement>, delta: number): void => {
    const input = event.currentTarget;
    const stepped = stepCssValue(input.value, input.selectionStart ?? 0, input.selectionEnd ?? 0, delta);

    if (stepped) {
      const parsedValue = parseCssColor(stepped.value);

      if (parsedValue) {
        event.preventDefault();
        pendingSelectionRef.current = { end: stepped.selectionEnd, start: stepped.selectionStart };
        onCommit(parsedValue);
      }
    }
  };

  return {
    inputRef: (node): void => {
      if (node) {
        focusPendingSelection(node, pendingSelectionRef);
      }
    },
    onBlur: (event): void => commitCssValue(event.target, value, onCommit),
    onKeyDown: (event): void => {
      if (event.key === 'Enter') {
        commitCssValue(event.currentTarget, value, onCommit);
        event.currentTarget.blur();
      } else if (event.key in ARROW_KEY_DELTA) {
        handleArrowKey(event, ARROW_KEY_DELTA[event.key]);
      }
    },
  };
};
