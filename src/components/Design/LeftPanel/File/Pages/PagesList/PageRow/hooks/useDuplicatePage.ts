import { nanoid } from '@reduxjs/toolkit';

// store
import { duplicatePage } from 'store/design/slice';
import { selectPages } from 'store/design/selectors';
import { useAppDispatch, useAppSelector } from 'store';

export const useDuplicatePage = (id: string): TFunc => {
  const dispatch = useAppDispatch();
  const pages = useAppSelector(selectPages);

  return (): void => {
    const source = pages[id];

    if (source) {
      const nodeIdMap = Object.fromEntries(Object.keys(source.nodes).map((nodeId) => [nodeId, nanoid()]));

      dispatch(duplicatePage({ newPageId: nanoid(), nodeIdMap, sourceId: id }));
    }
  };
};
