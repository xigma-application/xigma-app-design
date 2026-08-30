// hooks
import { useMoveNodes } from './useMoveNodes';

// types
import { TSceneNode } from 'types/design/types';

export const useHandleReorder = (): TFunc<[TSceneNode[], TSceneNode | null, number]> => {
  const handleMoveNodes = useMoveNodes();

  return (draggedItems: TSceneNode[], targetParentItem: TSceneNode | null, targetIndex: number): void => {
    handleMoveNodes({ nodeIds: draggedItems.map((item) => item.id), targetIndex, targetParentId: targetParentItem?.id ?? null });
  };
};
