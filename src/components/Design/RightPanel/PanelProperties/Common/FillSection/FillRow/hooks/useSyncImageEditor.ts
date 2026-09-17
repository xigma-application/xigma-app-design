import { useEffect, useRef } from 'react';

// store
import { selectSelectedNodes } from 'store/design/selectors';
import { setImageEditor, setImageFillPickerFocus } from 'store/design/slice';
import { store, useAppDispatch } from 'store';

export const useSyncImageEditor = (
  nodeId: string | undefined,
  paintIndex: number,
  isPickerOpen: boolean,
  isImageTabActive: boolean,
  hasStoredCrop: boolean,
  skipInitialArm: boolean,
): void => {
  const dispatch = useAppDispatch();
  const hasStoredCropRef = useRef(hasStoredCrop);
  const wasActiveRef = useRef(false);
  const isArmSkippedRef = useRef(skipInitialArm);
  hasStoredCropRef.current = hasStoredCrop;

  useEffect(() => {
    if (nodeId && isPickerOpen && isImageTabActive) {
      wasActiveRef.current = true;
      dispatch(setImageFillPickerFocus({ nodeId, paintIndex }));

      if (!isArmSkippedRef.current) {
        dispatch(setImageEditor({ mode: hasStoredCropRef.current ? 'crop' : 'position', nodeId, paintIndex }));
      }
    } else if (wasActiveRef.current && (!nodeId || !isImageTabActive)) {
      wasActiveRef.current = false;
      isArmSkippedRef.current = false;
      dispatch(setImageEditor(null));
      dispatch(setImageFillPickerFocus(null));
    }
  }, [dispatch, isImageTabActive, isPickerOpen, nodeId, paintIndex]);

  useEffect(() => {
    return (): void => {
      const isNodeStillSelected = Boolean(nodeId) && selectSelectedNodes(store.getState()).some((node) => node.id === nodeId);

      if (wasActiveRef.current && !isNodeStillSelected) {
        dispatch(setImageEditor(null));
        dispatch(setImageFillPickerFocus(null));
      }
    };
  }, [dispatch, nodeId]);
};
