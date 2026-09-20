import { FocusEvent } from 'react';

// utils
import { getSliderInputValue } from '../utils/getSliderInputValue';

export const useSliderInputBlur =
  (min: number, max: number, value: number, onChange: TFunc<[number]>): TFunc<[FocusEvent<HTMLInputElement>]> =>
  (event): void => {
    const next = getSliderInputValue(event.target.value, min, max);

    if (next !== undefined && next !== value) {
      onChange(next);
    }

    event.target.value = `${next ?? value}`;
  };
