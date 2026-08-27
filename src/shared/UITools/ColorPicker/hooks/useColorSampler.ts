import { useState } from 'react';

export type TUseColorSamplerResult = {
  close: TFunc;
  isActive: boolean;
  open: TFunc;
  pick: TFunc<[string]>;
};

export const useColorSampler = (setHex: TFunc<[string]>): TUseColorSamplerResult => {
  const [isActive, setIsActive] = useState(false);

  const open = (): void => setIsActive(true);
  const close = (): void => setIsActive(false);

  const pick = (hex: string): void => {
    setHex(hex);
    setIsActive(false);
  };

  return { close, isActive, open, pick };
};
