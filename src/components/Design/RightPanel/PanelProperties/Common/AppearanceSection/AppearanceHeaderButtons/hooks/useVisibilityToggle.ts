// store
import { selectSelectedNodes } from 'store/design/selectors';
import { toggleNodeHidden } from 'store/design/slice';
import { useAppDispatch, useAppSelector } from 'store';

// utils
import { commitOnNodes } from '../../utils/commitOnNodes';

export type TUseVisibilityToggleResult = {
  hidden: boolean;
  onToggle: () => void;
};

export const useVisibilityToggle = (): TUseVisibilityToggleResult => {
  const dispatch = useAppDispatch();
  const selectedNodes = useAppSelector(selectSelectedNodes);
  const hidden = selectedNodes.length > 0 && selectedNodes.every((node) => Boolean(node.hidden));

  return {
    hidden,
    onToggle: (): void => {
      commitOnNodes(
        dispatch,
        selectedNodes.filter((node) => Boolean(node.hidden) === hidden),
        (node) => dispatch(toggleNodeHidden(node.id)),
      );
    },
  };
};
