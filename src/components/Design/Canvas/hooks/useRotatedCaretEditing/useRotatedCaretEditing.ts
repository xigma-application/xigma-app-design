import { RefObject, useEffect, useRef } from 'react';

// others
import { MSDF_ATLAS_JSON } from 'constant/webgl/msdfAtlas';
import { ROTATED_TEXT_HIT_TOLERANCE_PX } from 'constant/canvas';
import { TEXT_FONT_SIZE } from '../../constants';

// store
import { selectEditingTextBox, selectEditingTextContent, selectViewport } from 'store/design/selectors';
import { store, useAppDispatch, useAppSelector } from 'store';
import { updateTextEditSelection } from 'store/design/slice';

// types
import { TEditingTextBox } from 'types/canvas';

// utils
import { getPointerPosition } from '../../utils/getPointerPosition';
import { getStraightCaretIndexAtPoint, TStraightCaretHit } from 'utils/canvas/text/getStraightCaretIndexAtPoint';
import { screenToWorld } from '../../utils/screenToWorld';
import { setEditableSelectionRange } from '../../components/TextEditOverlay/utils/setEditableSelectionRange';

const getEditingOverlay = (): HTMLElement | null => document.querySelector('[contenteditable="true"]');

const isBoxRotatedOrFlipped = (box: TEditingTextBox | null): boolean =>
  Boolean(box) && !box?.pathId && (box?.rotation !== 0 || box?.flipX || box?.flipY);

const getStraightHitAtEvent = (canvas: HTMLCanvasElement, event: PointerEvent): TStraightCaretHit | null => {
  const state = store.getState();
  const box = selectEditingTextBox(state);

  if (!box || box.pathId) {
    return null;
  }

  const viewport = selectViewport(state);
  const content = selectEditingTextContent(state);
  const point = screenToWorld(getPointerPosition(canvas, event), viewport);

  return getStraightCaretIndexAtPoint(MSDF_ATLAS_JSON, content, TEXT_FONT_SIZE, box, point);
};

export const useRotatedCaretEditing = (canvasRef: RefObject<HTMLCanvasElement | null>): void => {
  const dispatch = useAppDispatch();
  const editingTextBox = useAppSelector(selectEditingTextBox);
  const isActive = isBoxRotatedOrFlipped(editingTextBox);
  const anchorIndexRef = useRef<number | null>(null);

  const handlePointerDown = (canvas: HTMLCanvasElement, event: PointerEvent): void => {
    const overlay = getEditingOverlay();
    const isOnEditingSurface = event.target === canvas || Boolean(overlay && overlay.contains(event.target as Node));
    const hit = isOnEditingSurface ? getStraightHitAtEvent(canvas, event) : null;
    const viewport = selectViewport(store.getState());
    const tolerance = ROTATED_TEXT_HIT_TOLERANCE_PX / viewport.zoom;

    if (overlay && hit && hit.distance <= tolerance) {
      event.preventDefault();
      overlay.focus();
      setEditableSelectionRange(overlay, hit.index, hit.index);
      dispatch(updateTextEditSelection({ end: hit.index, start: hit.index }));
      anchorIndexRef.current = hit.index;
    } else {
      anchorIndexRef.current = null;
    }
  };

  const handlePointerMove = (canvas: HTMLCanvasElement, event: PointerEvent): void => {
    const overlay = getEditingOverlay();
    const anchor = anchorIndexRef.current;

    if (overlay && anchor !== null && event.buttons !== 0) {
      const hit = getStraightHitAtEvent(canvas, event);

      if (hit) {
        event.preventDefault();

        const start = Math.min(anchor, hit.index);
        const end = Math.max(anchor, hit.index);

        setEditableSelectionRange(overlay, start, end);
        dispatch(updateTextEditSelection({ end, start }));
      }
    }
  };

  const handlePointerUp = (): void => {
    anchorIndexRef.current = null;
  };

  useEffect(() => {
    const canvas = canvasRef.current;

    if (canvas && isActive) {
      const onPointerDown = (event: PointerEvent): void => handlePointerDown(canvas, event);
      const onPointerMove = (event: PointerEvent): void => handlePointerMove(canvas, event);
      const onPointerUp = (): void => handlePointerUp();

      document.addEventListener('pointerdown', onPointerDown);
      document.addEventListener('pointermove', onPointerMove);
      document.addEventListener('pointerup', onPointerUp);

      return (): void => {
        document.removeEventListener('pointerdown', onPointerDown);
        document.removeEventListener('pointermove', onPointerMove);
        document.removeEventListener('pointerup', onPointerUp);
        anchorIndexRef.current = null;
      };
    }
  }, [canvasRef, isActive]);
};
