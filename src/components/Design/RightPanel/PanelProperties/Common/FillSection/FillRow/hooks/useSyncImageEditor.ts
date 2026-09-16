import { useEffect } from 'react';

// store
import { setImageEditor } from 'store/design/slice';
import { useAppDispatch } from 'store';

export const useSyncImageEditor = (
  nodeId: string | undefined,
  paintIndex: number,
  isPickerOpen: boolean,
  isImageTabActive: boolean,
): void => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (nodeId && isPickerOpen && isImageTabActive) {
      dispatch(setImageEditor({ mode: 'position', nodeId, paintIndex }));
    } else if (!nodeId || !isImageTabActive) {
      dispatch(setImageEditor(null));
    }
  }, [dispatch, isImageTabActive, isPickerOpen, nodeId, paintIndex]);

  useEffect(() => {
    return (): void => {
      dispatch(setImageEditor(null));
    };
  }, [dispatch]);
};
