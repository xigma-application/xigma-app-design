import { useEffect, useRef } from 'react';

// store
import { selectEditingTextBox } from 'store/design/selectors';
import { useAppDispatch, useAppSelector } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TEditingTextBox } from 'types/canvas';

// utils
import { handleDoubleClick } from './utils/handleDoubleClick/handleDoubleClick';
import { handlePointerDown } from './utils/handlePointerDown/handlePointerDown';
import { handlePointerMove } from './utils/handlePointerMove/handlePointerMove';
import { handlePointerUp } from './utils/handlePointerUp/handlePointerUp';

const isEditingStraightBox = (box: TEditingTextBox | null): boolean => Boolean(box) && !box?.pathId;

export const useStraightCaretEditing = (refs: TCanvasRefs): void => {
  const { canvasRef } = refs;
  const dispatch = useAppDispatch();
  const editingTextBox = useAppSelector(selectEditingTextBox);
  const isActive = isEditingStraightBox(editingTextBox);
  const anchorIndexRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (canvas && isActive) {
      const onPointerDown = (event: PointerEvent): void => handlePointerDown(canvas, event, dispatch, anchorIndexRef);
      const onDoubleClick = (event: MouseEvent): void => handleDoubleClick(canvas, event, dispatch, anchorIndexRef);
      const onPointerMove = (event: PointerEvent): void => handlePointerMove(canvas, event, dispatch, anchorIndexRef);
      const onPointerUp = (): void => handlePointerUp(anchorIndexRef);

      document.addEventListener('pointerdown', onPointerDown);
      document.addEventListener('dblclick', onDoubleClick);
      document.addEventListener('pointermove', onPointerMove);
      document.addEventListener('pointerup', onPointerUp);

      return (): void => {
        document.removeEventListener('pointerdown', onPointerDown);
        document.removeEventListener('dblclick', onDoubleClick);
        document.removeEventListener('pointermove', onPointerMove);
        document.removeEventListener('pointerup', onPointerUp);
        anchorIndexRef.current = null;
      };
    }
  }, [canvasRef, dispatch, isActive]);
};
