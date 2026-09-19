import { FocusEvent, KeyboardEvent } from 'react';

// hooks
import { TStepNumbers } from 'hooks/useStepNumbersOnKeyDown/types';
import { useStepNumbersOnKeyDown } from 'hooks/useStepNumbersOnKeyDown/useStepNumbersOnKeyDown';

// types
import { TTextFieldWrapperProps } from '../TextFieldWrapper';

const commitStep = (text: string, event: KeyboardEvent<HTMLInputElement>, onBlur: TTextFieldWrapperProps['onBlur']): void => {
  const input = event.currentTarget;
  const { selectionEnd, selectionStart } = input;

  onBlur?.(event as unknown as FocusEvent<HTMLInputElement>);

  if (selectionStart !== null && selectionEnd !== null) {
    if (input.value === text) {
      input.setSelectionRange(selectionStart, selectionEnd);
    } else {
      input.select();
    }
  }
};

export const useStepNumbersThroughBlur = (
  stepNumbers: TStepNumbers | undefined,
  onBlur: TTextFieldWrapperProps['onBlur'],
  onKeyDown: TTextFieldWrapperProps['onKeyDown'],
): TTextFieldWrapperProps['onKeyDown'] => {
  const handleStep = useStepNumbersOnKeyDown({ ...stepNumbers, onStep: (text, event) => commitStep(text, event, onBlur) });

  if (stepNumbers) {
    return (event): void => {
      handleStep(event);
      onKeyDown?.(event);
    };
  }

  return onKeyDown;
};
