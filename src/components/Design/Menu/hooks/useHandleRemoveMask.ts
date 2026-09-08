// store
import { ungroupNodes } from 'store/design/slice';
import { useAppDispatch } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TSceneNode } from 'types/design/types';

export const useHandleRemoveMask = (node: TSceneNode, onRemoveMask: TFunc): TFunc => {
  const dispatch = useAppDispatch();

  return (): void => {
    if (node.type === NodeType.mask) {
      dispatch(ungroupNodes([node.id]));
    } else {
      onRemoveMask();
    }
  };
};
