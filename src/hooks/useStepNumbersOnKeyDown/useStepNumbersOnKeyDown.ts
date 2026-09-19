import { KeyboardEvent } from 'react';

// types
import { TStepNumbersOnKeyDownOptions } from './types';

// utils
import { handleStepNumbersKeyDown } from './utils/handleStepNumbersKeyDown';

export const useStepNumbersOnKeyDown =
  (options: TStepNumbersOnKeyDownOptions = {}): TFunc<[KeyboardEvent<HTMLInputElement>]> =>
  (event: KeyboardEvent<HTMLInputElement>): void =>
    handleStepNumbersKeyDown(event, options);
