import { KeyboardEvent } from 'react';

// types
import { TTextFieldWrapperProps } from '../TextFieldWrapper';

export const useStopInputKeyPropagation = (onKeyDown: TTextFieldWrapperProps['onKeyDown']): TFunc<[KeyboardEvent<HTMLInputElement>]> => {
  return (event: KeyboardEvent<HTMLInputElement>): void => {
    event.stopPropagation();

    switch (event.key) {
      case 'Enter':
        event.currentTarget.blur();
        break;
      default:
        break;
    }

    onKeyDown?.(event);
  };
};
