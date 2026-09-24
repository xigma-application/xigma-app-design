import { FocusEvent } from 'react';

// utils
import { getSliderInputValue } from '../utils/getSliderInputValue';

export const useSliderInputBlur =
  (min: number, max: number, value: number, onChange: TFunc<[number]>, displayValue?: string): TFunc<[FocusEvent<HTMLInputElement>]> =>
  (event): void => {
    const next = getSliderInputValue(event.target.value, min, max);

    if (next !== undefined && (next !== value || displayValue !== undefined)) {
      onChange(next);
    }

    event.target.value = next === undefined ? (displayValue ?? `${value}`) : `${next}`;
  };
