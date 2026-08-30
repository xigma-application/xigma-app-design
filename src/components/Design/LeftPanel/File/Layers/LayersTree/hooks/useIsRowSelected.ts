// store
import { selectSelectedIds } from 'store/design/selectors';
import { useAppSelector } from 'store';

// types
import { TSceneNode } from 'types/design/types';

export const useIsRowSelected = (): TFunc<[TSceneNode], boolean> => {
  const selectedIds = useAppSelector(selectSelectedIds);
  return (item: TSceneNode): boolean => selectedIds.includes(item.id);
};
