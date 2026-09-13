import { MouseEvent } from 'react';

// hooks
import { TFillSelectModifiers } from '../../hooks/useFillSection/hooks/useFillSelection/useFillSelection';

const NO_SELECT_SELECTOR = '[data-no-select], [data-radix-popper-content-wrapper]';

export const useSelectFillRow = (onSelect: TFunc<[TFillSelectModifiers]>): TFunc<[MouseEvent<HTMLDivElement>]> => {
  return (event: MouseEvent<HTMLDivElement>): void => {
    const target = event.target as HTMLElement;

    if (!target.closest(NO_SELECT_SELECTOR)) {
      onSelect({ meta: event.metaKey || event.ctrlKey, shift: event.shiftKey });
    }
  };
};
