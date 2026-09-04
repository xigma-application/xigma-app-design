// store
import { toggleMaskOutlinesVisible } from 'store/design/slice';
import { useAppDispatch } from 'store';

export const useViewMenuMaskOutlinesClick = (): (() => void) => {
  const dispatch = useAppDispatch();

  return () => {
    dispatch(toggleMaskOutlinesVisible());
  };
};
