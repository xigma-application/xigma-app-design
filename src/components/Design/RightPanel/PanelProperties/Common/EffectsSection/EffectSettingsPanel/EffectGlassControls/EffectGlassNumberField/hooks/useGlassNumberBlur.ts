import { FocusEvent } from 'react';

// others
import { MIXED_LABEL } from 'components/Design/RightPanel/PanelProperties/Common/constants';

// utils
import { getEffectNumberFromInput } from 'utils/design/effects/getEffectNumberFromInput';

export const useGlassNumberBlur =
  (min: number, max: number, value: number | undefined, unit: string, onChange: TFunc<[number]>): TFunc<[FocusEvent<HTMLInputElement>]> =>
  (event): void => {
    const next = getEffectNumberFromInput(event.target.value, min, max);

    if (next !== undefined && next !== value) {
      onChange(next);
    }

    const shown = next ?? value;
    event.target.value = shown === undefined ? MIXED_LABEL : `${shown}${unit}`;
  };
