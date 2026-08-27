import { FocusEvent, KeyboardEvent, useRef } from 'react';

// utils
import { isValidHex } from '../../../../../utils/isValidHex';
import { normalizeHex } from '../../../../../utils/normalizeHex';
import { stepHexValue } from '../utils/stepHexValue';

export type TUseHexFieldCommitResult = {
  inputRef: TFunc<[HTMLInputElement | null]>;
  onBlur: TFunc<[FocusEvent<HTMLInputElement>]>;
  onKeyDown: TFunc<[KeyboardEvent<HTMLInputElement>]>;
};

type TPendingSelection = { end: number; start: number };

const ARROW_KEY_DELTA: Record<string, number> = { ArrowDown: -1, ArrowUp: 1 };

const commitHexValue = (input: HTMLInputElement, hex: string, onCommit: TFunc<[string]>): void => {
  if (isValidHex(input.value)) {
    onCommit(normalizeHex(input.value));
  } else {
    input.value = hex.replace('#', '');
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

export const useHexFieldCommit = (hex: string, onCommit: TFunc<[string]>): TUseHexFieldCommitResult => {
  const pendingSelectionRef = useRef<TPendingSelection | null>(null);

  const handleArrowKey = (event: KeyboardEvent<HTMLInputElement>, delta: number): void => {
    const input = event.currentTarget;

    if (isValidHex(input.value)) {
      event.preventDefault();

      const currentHex = normalizeHex(input.value).replace('#', '');
      const { hex, selectionEnd, selectionStart } = stepHexValue(currentHex, input.selectionStart ?? 0, input.selectionEnd ?? 0, delta);

      pendingSelectionRef.current = { end: selectionEnd, start: selectionStart };
      onCommit(normalizeHex(hex));
    }
  };

  return {
    inputRef: (node): void => {
      if (node) {
        focusPendingSelection(node, pendingSelectionRef);
      }
    },
    onBlur: (event): void => commitHexValue(event.target, hex, onCommit),
    onKeyDown: (event): void => {
      if (event.key === 'Enter') {
        commitHexValue(event.currentTarget, hex, onCommit);
        event.currentTarget.blur();
      } else if (event.key in ARROW_KEY_DELTA) {
        handleArrowKey(event, ARROW_KEY_DELTA[event.key]);
      }
    },
  };
};
