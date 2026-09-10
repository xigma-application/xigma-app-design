import { MouseEvent } from 'react';

// types
import { TTextFieldWrapperProps } from '../TextFieldWrapper';

export const useSelectInputOnClick = (onClick: TTextFieldWrapperProps['onClick']): TFunc<[MouseEvent<HTMLInputElement>]> => {
  return (event: MouseEvent<HTMLInputElement>): void => {
    event.currentTarget.select();
    onClick?.(event);
  };
};
