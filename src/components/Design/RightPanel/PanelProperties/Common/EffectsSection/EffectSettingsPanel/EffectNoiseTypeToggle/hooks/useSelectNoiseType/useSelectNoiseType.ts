// types
import { EffectNoiseType } from 'types/design/enums';

export const useSelectNoiseType =
  (onChange: TFunc<[EffectNoiseType]>): TFunc<[string]> =>
  (value): void => {
    if (value !== EffectNoiseType.multi) {
      onChange(value as EffectNoiseType);
    }
  };
