import { useCallback } from 'react';

// store
import { selectIsPatternSourcePicking } from 'store/design/selectors';
import { setPatternSourcePicking } from 'store/design/slice';
import { useAppDispatch, useAppSelector } from 'store';

export type TUsePatternSourcePickingResult = { close: TFunc; isActive: boolean; open: TFunc };

export const usePatternSourcePicking = (): TUsePatternSourcePickingResult => {
  const dispatch = useAppDispatch();
  const isActive = useAppSelector(selectIsPatternSourcePicking);

  const open = useCallback((): void => {
    dispatch(setPatternSourcePicking(true));
  }, [dispatch]);

  const close = useCallback((): void => {
    dispatch(setPatternSourcePicking(false));
  }, [dispatch]);

  return { close, isActive, open };
};
