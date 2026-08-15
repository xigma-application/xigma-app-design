import { RefObject, useEffect, useRef } from 'react';

// others
import { useClassNames } from '../../../core/ClassNamesProvider/hooks/useClassNames';

// store
import { selectEditingTextBox } from 'store/design/selectors';
import { useAppDispatch, useAppSelector } from 'store';

// utils
import { handlePointerDown } from './utils/handlePointerDown/handlePointerDown';
import { handlePointerMove } from './utils/handlePointerMove/handlePointerMove';
import { handlePointerUp } from './utils/handlePointerUp/handlePointerUp';

export const useCurvedCaretEditing = (canvasRef: RefObject<HTMLCanvasElement | null>): void => {
  const dispatch = useAppDispatch();
  const editingPathId = useAppSelector(selectEditingTextBox)?.pathId;
  const { setClassName } = useClassNames();
  const anchorIndexRef = useRef<number | null>(null);
  const isDraggingOffsetRef = useRef<boolean>(false);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (canvas && editingPathId) {
      const onPointerDown = (event: PointerEvent): void =>
        handlePointerDown(canvas, event, dispatch, anchorIndexRef, isDraggingOffsetRef, setClassName);
      const onPointerMove = (event: PointerEvent): void => handlePointerMove(canvas, event, dispatch, anchorIndexRef, isDraggingOffsetRef);
      const onPointerUp = (): void => handlePointerUp(anchorIndexRef, isDraggingOffsetRef, setClassName);

      document.addEventListener('pointerdown', onPointerDown);
      document.addEventListener('pointermove', onPointerMove);
      document.addEventListener('pointerup', onPointerUp);

      return (): void => {
        document.removeEventListener('pointerdown', onPointerDown);
        document.removeEventListener('pointermove', onPointerMove);
        document.removeEventListener('pointerup', onPointerUp);
        anchorIndexRef.current = null;
        isDraggingOffsetRef.current = false;
      };
    }
  }, [canvasRef, dispatch, editingPathId, setClassName]);
};
