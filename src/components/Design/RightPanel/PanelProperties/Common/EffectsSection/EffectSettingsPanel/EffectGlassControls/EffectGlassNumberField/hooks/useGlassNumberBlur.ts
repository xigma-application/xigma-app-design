import { FocusEvent } from 'react';

// utils
import { getEffectNumberFromInput } from 'utils/design/effects/getEffectNumberFromInput';

export const useGlassNumberBlur =
  (min: number, max: number, value: number, unit: string, onChange: TFunc<[number]>): TFunc<[FocusEvent<HTMLInputElement>]> =>
  (event): void => {
    const next = getEffectNumberFromInput(event.target.value, min, max);

    if (next !== undefined && next !== value) {
      onChange(next);
    }

    event.target.value = `${next ?? value}${unit}`;
  };
