// store
import { selectDescendantIdsOfSelected } from 'store/design/selectors';
import { useAppSelector } from 'store';

// types
import { TSceneNode } from 'types/design/types';

export const useIsRowHighlighted = (): TFunc<[TSceneNode], boolean> => {
  const descendantIds = useAppSelector(selectDescendantIdsOfSelected);
  return (item: TSceneNode): boolean => descendantIds.has(item.id);
};
