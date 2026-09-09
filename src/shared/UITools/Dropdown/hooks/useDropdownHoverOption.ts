import { useEffect } from 'react';

// types
import { TDropdownOption } from '../types';

export const useDropdownHoverOption = <TValue extends string>(
  options: TDropdownOption<TValue>[],
  highlightedIndex: number,
  isOpen: boolean,
  onHoverOption: TFunc<[TValue | null]> | undefined,
): void => {
  const hoveredValue = isOpen ? (options[highlightedIndex]?.value ?? null) : null;

  useEffect(() => {
    if (onHoverOption) {
      onHoverOption(hoveredValue);
    }
  }, [hoveredValue, onHoverOption]);
};
