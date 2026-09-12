import { useState } from 'react';

// types
import { BlendMode } from 'types/design/enums';

export type TUseBlendModeMenuResult = {
  selectBlendMode: (blendMode: BlendMode) => TFunc;
  value: BlendMode;
};

export const useBlendModeMenu = (): TUseBlendModeMenuResult => {
  const [value, setValue] = useState(BlendMode.passThrough);

  return {
    selectBlendMode: (blendMode: BlendMode) => (): void => setValue(blendMode),
    value,
  };
};
