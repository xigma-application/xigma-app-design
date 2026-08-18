import { useEffect, useRef } from 'react';

// types
import { TCanvasRefs } from 'types/design/canvas/types';

// others
import { useClassNames } from '../../../core/ClassNamesProvider/hooks/useClassNames';

// store
import { selectEditingTextBox } from 'store/design/selectors';
import { useAppDispatch, useAppSelector } from 'store';

// utils
import { handleDoubleClick } from './utils/handleDoubleClick/handleDoubleClick';
import { handlePointerDown } from './utils/handlePointerDown/handlePointerDown';
import { handlePointerMove } from './utils/handlePointerMove/handlePointerMove';
import { handlePointerUp } from './utils/handlePointerUp/handlePointerUp';

export const useCurvedCaretEditing = (refs: TCanvasRefs): void => {
  const { canvasRef } = refs;
  const dispatch = useAppDispatch();
  const editingPathId = useAppSelector(selectEditingTextBox)?.pathId;
  const { setClassName } = useClassNames();
  const anchorIndexRef = useRef<number | null>(null);
  const isDraggingOffsetRef = useRef<boolean>(false);

  const onPointerDown = (canvas: HTMLCanvasElement, event: PointerEvent): void =>
    handlePointerDown(canvas, event, dispatch, anchorIndexRef, isDraggingOffsetRef, setClassName);

  const onDoubleClick = (canvas: HTMLCanvasElement, event: MouseEvent): void => handleDoubleClick(canvas, event, dispatch, anchorIndexRef);

  const onPointerMove = (canvas: HTMLCanvasElement, event: PointerEvent): void =>
    handlePointerMove(canvas, event, dispatch, anchorIndexRef, isDraggingOffsetRef);

  const onPointerUp = (): void => handlePointerUp(anchorIndexRef, isDraggingOffsetRef, setClassName);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (canvas && editingPathId) {
      const pointerDownListener = (event: PointerEvent): void => onPointerDown(canvas, event);
      const doubleClickListener = (event: MouseEvent): void => onDoubleClick(canvas, event);
      const pointerMoveListener = (event: PointerEvent): void => onPointerMove(canvas, event);

      document.addEventListener('pointerdown', pointerDownListener);
      document.addEventListener('dblclick', doubleClickListener);
      document.addEventListener('pointermove', pointerMoveListener);
      document.addEventListener('pointerup', onPointerUp);

      return (): void => {
        document.removeEventListener('pointerdown', pointerDownListener);
        document.removeEventListener('dblclick', doubleClickListener);
        document.removeEventListener('pointermove', pointerMoveListener);
        document.removeEventListener('pointerup', onPointerUp);
        anchorIndexRef.current = null;
        isDraggingOffsetRef.current = false;
      };
    }
  }, [canvasRef, dispatch, editingPathId, setClassName]);
};
