import { KeyboardEvent, useState } from 'react';

// types
import { TDropdownOption } from '../types';

// utils
import { clamp } from 'utils/math/clamp';

const ARROW_KEY_STEP: Record<string, number> = { ArrowDown: 1, ArrowUp: -1 };

const getInitialHighlightedIndex = <TValue extends string>(options: TDropdownOption<TValue>[], value: TValue): number =>
  Math.max(
    0,
    options.findIndex((option) => option.value === value),
  );

export type TUseDropdownStateResult = {
  handleKeyDown: TFunc<[KeyboardEvent<HTMLDivElement>]>;
  handleOpenChange: TFunc<[boolean]>;
  highlightedIndex: number;
  isOpen: boolean;
  setHighlightedIndex: TFunc<[number]>;
};

export const useDropdownState = <TValue extends string>(
  options: TDropdownOption<TValue>[],
  value: TValue,
  onSelect: TFunc<[TValue]>,
): TUseDropdownStateResult => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(() => getInitialHighlightedIndex(options, value));

  const handleOpenChange = (open: boolean): void => {
    setIsOpen(open);

    if (open) {
      setHighlightedIndex(getInitialHighlightedIndex(options, value));
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    const step = ARROW_KEY_STEP[event.key];

    if (step) {
      event.preventDefault();
      setHighlightedIndex(clamp(highlightedIndex + step, 0, options.length - 1));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      onSelect(options[highlightedIndex].value);
      setIsOpen(false);
    }
  };

  return { handleKeyDown, handleOpenChange, highlightedIndex, isOpen, setHighlightedIndex };
};
