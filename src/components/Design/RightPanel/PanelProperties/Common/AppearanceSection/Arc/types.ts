// types
import { FocusEvent } from 'react';

export type TArcFieldKey = 'ratio' | 'start' | 'sweep';

export type TArcValues = Record<TArcFieldKey, number>;

export type TArcField = {
  displayValue: string;
  key: TArcFieldKey;
  max: number;
  min: number;
  onBlur: (event: FocusEvent<HTMLInputElement>) => void;
  onScrub: (next: number) => void;
  value: number;
};
