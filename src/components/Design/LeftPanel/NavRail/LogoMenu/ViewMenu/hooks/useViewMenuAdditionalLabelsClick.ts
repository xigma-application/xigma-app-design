// store
import { toggleAdditionalLabels } from 'store/design/slice';
import { useAppDispatch } from 'store';

export const useViewMenuAdditionalLabelsClick = (): (() => void) => {
  const dispatch = useAppDispatch();

  return () => {
    dispatch(toggleAdditionalLabels());
  };
};
