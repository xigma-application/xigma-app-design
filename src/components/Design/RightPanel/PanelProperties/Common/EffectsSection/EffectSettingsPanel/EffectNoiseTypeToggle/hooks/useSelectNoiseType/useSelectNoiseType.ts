// types
import { EffectNoiseType } from 'types/design/enums';

export const useSelectNoiseType =
  (onChange: TFunc<[EffectNoiseType]>): TFunc<[string]> =>
  (value): void => {
    onChange(value as EffectNoiseType);
  };
