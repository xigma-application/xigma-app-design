// types
import { SizingMode } from 'types/design/enums';

// utils
import { roundTrackSize } from '../utils/roundTrackSize';

export const useCommitTrackMode = (onChangeMode: (mode: SizingMode, value?: number) => void, resolvedSize: number): TFunc<[SizingMode]> => {
  return (mode: SizingMode): void => {
    onChangeMode(mode, mode === SizingMode.fixed ? roundTrackSize(resolvedSize) : undefined);
  };
};
