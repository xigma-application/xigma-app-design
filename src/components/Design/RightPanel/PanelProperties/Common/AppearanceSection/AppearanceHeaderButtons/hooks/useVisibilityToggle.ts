// store
import { selectSelectedNodes } from 'store/design/selectors';
import { toggleNodeHidden } from 'store/design/slice';
import { useAppDispatch, useAppSelector } from 'store';

export type TUseVisibilityToggleResult = {
  hidden: boolean;
  onToggle: () => void;
};

export const useVisibilityToggle = (): TUseVisibilityToggleResult => {
  const dispatch = useAppDispatch();
  const [selectedNode] = useAppSelector(selectSelectedNodes);
  const id = selectedNode?.id ?? '';

  return {
    hidden: Boolean(selectedNode?.hidden),
    onToggle: (): void => {
      dispatch(toggleNodeHidden(id));
    },
  };
};
