// store
import { reorderPages } from 'store/design/slice';
import { selectPages } from 'store/design/selectors';
import { useAppDispatch, useAppSelector } from 'store';

// types
import { TDesignPage } from 'store/design/types';

export const useReorderPages = (): TFunc<[TDesignPage[], TDesignPage | null, number]> => {
  const dispatch = useAppDispatch();
  const pages = useAppSelector(selectPages);

  return (draggedItems: TDesignPage[], _targetParentItem: TDesignPage | null, toIndex: number): void => {
    const [draggedItem] = draggedItems;

    if (draggedItem) {
      const fromIndex = Object.keys(pages).indexOf(draggedItem.id);

      if (fromIndex !== -1) {
        dispatch(reorderPages({ fromIndex, toIndex }));
      }
    }
  };
};
