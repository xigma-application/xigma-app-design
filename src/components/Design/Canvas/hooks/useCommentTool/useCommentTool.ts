import { useEffect } from 'react';

// store
import { selectActiveTool, selectCommentDraftPosition, selectViewport } from 'store/design/selectors';
import { setSelection, startCommentDraft } from 'store/design/slice';
import { store, useAppDispatch, useAppSelector } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { ToolName } from 'types/design/enums';
import { MouseButton } from 'types/enums';

// utils
import { getPointerPosition } from 'utils/math/pointer/getPointerPosition';
import { screenToWorld } from 'utils/transform/screenToWorld';

export const useCommentTool = (refs: TCanvasRefs): void => {
  const { canvasRef } = refs;
  const activeTool = useAppSelector(selectActiveTool);
  const dispatch = useAppDispatch();

  const handlePointerDown = (canvas: HTMLCanvasElement, event: PointerEvent): void => {
    const state = store.getState();

    if (event.button === MouseButton.primary && !selectCommentDraftPosition(state)) {
      dispatch(setSelection([]));
      dispatch(startCommentDraft(screenToWorld(getPointerPosition(canvas, event), selectViewport(state))));
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;

    if (canvas && activeTool === ToolName.comment) {
      const onPointerDown = (event: PointerEvent): void => handlePointerDown(canvas, event);
      canvas.addEventListener('pointerdown', onPointerDown);

      return (): void => canvas.removeEventListener('pointerdown', onPointerDown);
    }
  }, [activeTool, canvasRef, dispatch]);
};
