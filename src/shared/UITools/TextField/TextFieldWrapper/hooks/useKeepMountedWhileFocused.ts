import { FocusEvent, useState } from 'react';

// types
import { TTextFieldWrapperProps } from '../TextFieldWrapper';

type TInputKey = string | number | undefined;

type TKeepMountedWhileFocused = {
  handleBlur: TFunc<[FocusEvent<HTMLInputElement>]>;
  handleFocus: TFunc<[FocusEvent<HTMLInputElement>]>;
  inputKey: TInputKey;
};

export const useKeepMountedWhileFocused = (
  enabled: boolean,
  defaultValue: TInputKey,
  onBlur: TTextFieldWrapperProps['onBlur'],
  onFocus: TTextFieldWrapperProps['onFocus'],
): TKeepMountedWhileFocused => {
  const [frozenKey, setFrozenKey] = useState<TInputKey>();

  return {
    handleBlur: (event: FocusEvent<HTMLInputElement>): void => {
      setFrozenKey(undefined);
      onBlur?.(event);
    },
    handleFocus: (event: FocusEvent<HTMLInputElement>): void => {
      if (enabled) {
        setFrozenKey(defaultValue);
      }

      onFocus?.(event);
    },
    inputKey: frozenKey ?? defaultValue,
  };
};
