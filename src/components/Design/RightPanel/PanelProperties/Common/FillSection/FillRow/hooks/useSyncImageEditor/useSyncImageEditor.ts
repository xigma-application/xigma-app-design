import { useEffect, useRef } from 'react';

// store
import { selectSelectedNodes } from 'store/design/selectors';
import { setImageEditor, setImageFillPickerFocus } from 'store/design/slice';
import { store, useAppDispatch } from 'store';

// types
import { TImageEditorMode } from 'store/design/types';

// utils
import { clearOwnedImageEditorState } from './utils/clearOwnedImageEditorState';

export const useSyncImageEditor = (
  nodeId: string | undefined,
  paintIndex: number,
  isPickerOpen: boolean,
  isImageTabActive: boolean,
  initialMode: TImageEditorMode,
  skipInitialArm: boolean,
): void => {
  const dispatch = useAppDispatch();
  const initialModeRef = useRef(initialMode);
  const wasActiveRef = useRef(false);
  const isArmSkippedRef = useRef(skipInitialArm);
  initialModeRef.current = initialMode;

  useEffect(() => {
    if (nodeId && isPickerOpen && isImageTabActive) {
      wasActiveRef.current = true;
      dispatch(setImageFillPickerFocus({ nodeId, paintIndex }));

      if (!isArmSkippedRef.current) {
        dispatch(setImageEditor({ mode: initialModeRef.current, nodeId, paintIndex }));
      }
    } else if (wasActiveRef.current && (!nodeId || !isImageTabActive)) {
      wasActiveRef.current = false;
      isArmSkippedRef.current = false;
      clearOwnedImageEditorState(dispatch, nodeId, paintIndex);
    }
  }, [dispatch, isImageTabActive, isPickerOpen, nodeId, paintIndex]);

  useEffect(() => {
    return (): void => {
      const isNodeStillSelected = Boolean(nodeId) && selectSelectedNodes(store.getState()).some((node) => node.id === nodeId);

      if (wasActiveRef.current && !isNodeStillSelected) {
        clearOwnedImageEditorState(dispatch, nodeId, paintIndex);
      }
    };
  }, [dispatch, nodeId, paintIndex]);
};
