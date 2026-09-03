// store
import { toggleAdditionalLabels } from 'store/design/slice';
import { useAppDispatch } from 'store';

export const useAdditionalLabelsClick = (): (() => void) => {
  const dispatch = useAppDispatch();

  return (): void => {
    dispatch(toggleAdditionalLabels());
  };
};
