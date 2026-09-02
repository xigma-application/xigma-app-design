// store
import { toggleRulers } from 'store/design/slice';
import { useAppDispatch } from 'store';

export const useViewMenuRulersClick = (): (() => void) => {
  const dispatch = useAppDispatch();

  return () => {
    dispatch(toggleRulers());
  };
};
