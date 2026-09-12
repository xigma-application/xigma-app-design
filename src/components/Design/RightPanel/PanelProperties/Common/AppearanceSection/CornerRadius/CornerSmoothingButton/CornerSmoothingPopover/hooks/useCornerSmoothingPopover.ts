import { FocusEvent, useState } from 'react';

export type TUseCornerSmoothingPopoverResult = {
  onBlur: TFunc<[FocusEvent<HTMLInputElement>]>;
  onSliderChange: TFunc<[number]>;
  value: number;
};

const clampSmoothing = (raw: number): number => Math.min(100, Math.max(0, Math.round(raw)));

export const useCornerSmoothingPopover = (): TUseCornerSmoothingPopoverResult => {
  const [value, setValue] = useState(0);

  return {
    onBlur: (event): void => {
      const stripped = event.target.value.trim().replace(/[^\d.-]/g, '');
      const parsed = Number(stripped);

      if (stripped !== '' && !Number.isNaN(parsed)) {
        setValue(clampSmoothing(parsed));
      } else {
        event.target.value = `${value}%`;
      }
    },
    onSliderChange: (next): void => setValue(clampSmoothing(next)),
    value,
  };
};
