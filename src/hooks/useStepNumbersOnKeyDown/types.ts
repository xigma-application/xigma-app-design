import { KeyboardEvent } from 'react';

export type TStepNumbersOnKeyDownOptions = {
  max?: number;
  min?: number;
  onStep?: TFunc<[string, KeyboardEvent<HTMLInputElement>]>;
  shiftStep?: number;
  step?: number;
};

export type TStepNumbers = Omit<TStepNumbersOnKeyDownOptions, 'onStep'>;
