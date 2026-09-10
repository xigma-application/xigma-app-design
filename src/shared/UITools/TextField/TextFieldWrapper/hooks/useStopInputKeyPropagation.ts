import { KeyboardEvent } from 'react';

// types
import { TTextFieldWrapperProps } from '../TextFieldWrapper';

export const useStopInputKeyPropagation = (onKeyDown: TTextFieldWrapperProps['onKeyDown']): TFunc<[KeyboardEvent<HTMLInputElement>]> => {
  return (event: KeyboardEvent<HTMLInputElement>): void => {
    switch (event.key) {
      case 'Enter':
        event.stopPropagation();
        event.currentTarget.blur();
        break;
      case 'Backspace':
      case 'Delete':
        event.stopPropagation();
        break;
      default:
        break;
    }

    onKeyDown?.(event);
  };
};
