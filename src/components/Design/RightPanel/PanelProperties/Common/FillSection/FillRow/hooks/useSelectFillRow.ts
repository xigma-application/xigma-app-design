import { MouseEvent } from 'react';

// hooks
import { TFillSelectModifiers } from '../../hooks/useFillSection/hooks/useFillSelection/useFillSelection';

export const useSelectFillRow = (onSelect: TFunc<[TFillSelectModifiers]>): TFunc<[MouseEvent<HTMLDivElement>]> => {
  return (event: MouseEvent<HTMLDivElement>): void => {
    onSelect({ meta: event.metaKey || event.ctrlKey, shift: event.shiftKey });
  };
};
