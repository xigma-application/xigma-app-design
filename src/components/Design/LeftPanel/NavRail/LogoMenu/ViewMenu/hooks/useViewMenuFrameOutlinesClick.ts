// store
import { toggleFrameOutlinesVisible } from 'store/design/slice';
import { useAppDispatch } from 'store';

export const useViewMenuFrameOutlinesClick = (): (() => void) => {
  const dispatch = useAppDispatch();

  return () => {
    dispatch(toggleFrameOutlinesVisible());
  };
};
