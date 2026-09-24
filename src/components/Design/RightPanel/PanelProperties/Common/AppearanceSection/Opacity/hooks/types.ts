// types
import { FocusEvent } from 'react';

export type TUseOpacityResult = {
  displayValue: string;
  onBlur: (event: FocusEvent<HTMLInputElement>) => void;
  onScrub: (next: number) => void;
  value: number;
};
