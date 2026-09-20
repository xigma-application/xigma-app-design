import { MouseEvent } from 'react';

const NO_SELECT_SELECTOR = '[data-no-select], [data-radix-popper-content-wrapper]';

export const useSelectLayoutGuideRow = (onSelect: TFunc): TFunc<[MouseEvent<HTMLDivElement>]> => {
  return (event: MouseEvent<HTMLDivElement>): void => {
    const target = event.target as HTMLElement;

    if (!target.closest(NO_SELECT_SELECTOR)) {
      onSelect();
    }
  };
};
