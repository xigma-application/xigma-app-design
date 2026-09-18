// types
import { BlendMode } from 'types/design/enums';
import { TPaint } from 'types/design/paint/types';

export const useSetFillBlendMode = (paint: TPaint, onChange: TFunc<[TPaint]>): TFunc<[BlendMode]> => {
  return (blendMode: BlendMode): void => {
    onChange({ ...paint, blendMode });
  };
};
