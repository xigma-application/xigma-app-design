import { useEffect, useRef } from 'react';

// store
import { setImageEditor } from 'store/design/slice';
import { useAppDispatch } from 'store';

export const useSyncImageEditor = (
  nodeId: string | undefined,
  paintIndex: number,
  isPickerOpen: boolean,
  isImageTabActive: boolean,
  hasStoredCrop: boolean,
): void => {
  const dispatch = useAppDispatch();
  const hasStoredCropRef = useRef(hasStoredCrop);
  hasStoredCropRef.current = hasStoredCrop;

  useEffect(() => {
    if (nodeId && isPickerOpen && isImageTabActive) {
      dispatch(setImageEditor({ mode: hasStoredCropRef.current ? 'crop' : 'position', nodeId, paintIndex }));
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
