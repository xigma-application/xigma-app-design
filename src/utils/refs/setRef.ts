import { RefObject } from 'react';

export const setRef = <TRefs, TKey extends keyof TRefs>(
  refs: TRefs,
  key: TKey,
  value: TRefs[TKey] extends RefObject<infer TValue> ? TValue : never,
): void => {
  (refs[key] as RefObject<typeof value>).current = value;
};
