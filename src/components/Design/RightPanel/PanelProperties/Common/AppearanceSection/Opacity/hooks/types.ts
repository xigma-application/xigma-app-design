// types
import { FocusEvent } from 'react';

export type TUseOpacityResult = {
  onBlur: (event: FocusEvent<HTMLInputElement>) => void;
  onScrub: (next: number) => void;
  value: number;
};
