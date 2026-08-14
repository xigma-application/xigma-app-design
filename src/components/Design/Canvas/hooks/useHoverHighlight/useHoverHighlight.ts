import { RefObject, useEffect } from 'react';

// store
import {
  selectActiveTool,
  selectEditingNodeId,
  selectEditingTextBox,
  selectOrderedNodes,
  selectSelectedNodes,
  selectViewport,
} from 'store/design/selectors';
import { store, useAppSelector } from 'store';

// styles
import styles from '../../canvas.module.scss';

// types
import { NodeType, ToolName } from 'types/design/enums';

// utils
import { getLineEndpointAtPoint } from '../../utils/getLineEndpointAtPoint';
import { getNodeAtPoint } from '../../utils/getNodeAtPoint';
import { getPathTextOffsetHandleAtPoint } from '../../utils/getPathTextOffsetHandleAtPoint';
import { getPointerPosition } from '../../utils/getPointerPosition';
import { getResizeCursorAngle } from 'utils/math/getResizeCursorAngle';
import { getResizeHandleAtPoint } from '../../utils/getResizeHandleAtPoint';
import { getRotateCursorAngle } from 'utils/math/getRotateCursorAngle';
import { getRotateHandleAtPoint } from '../../utils/getRotateHandleAtPoint';
import { getRotatedResizeCursorUrl } from 'utils/canvas/getRotatedResizeCursorUrl';
import { getRotatedRotateCursorUrl } from 'utils/canvas/getRotatedRotateCursorUrl';
import { getRotatedScaleCursorUrl } from 'utils/canvas/getRotatedScaleCursorUrl';
import { isPointOnPathTextHandle } from '../../utils/isPointOnPathTextHandle';
import { screenToWorld } from '../../utils/screenToWorld';

const POSITIONING_CURSOR_CLASS = styles['Canvas__canvas-element--positioning'];

export const useHoverHighlight = (canvasRef: RefObject<HTMLCanvasElement | null>, hoverRef: RefObject<string | null>): void => {
  const activeTool = useAppSelector(selectActiveTool);

  const handlePointerMove = (canvas: HTMLCanvasElement, event: PointerEvent): void => {
    if (event.buttons === 0) {
      const state = store.getState();
      const viewport = selectViewport(state);
      const point = screenToWorld(getPointerPosition(canvas, event), viewport);
      const editingTextBox = selectEditingTextBox(state);
      const isEditingText = Boolean(editingTextBox);
      const selectedNodes = selectSelectedNodes(state);
      const resizableSelectedNodes = isEditingText ? [] : selectedNodes;
      const [selectedNode] = resizableSelectedNodes;
      const lineEndpointHit = getLineEndpointAtPoint(point, resizableSelectedNodes, viewport);
      // during an active edit (including a path-text node still being drawn for the first time,
      // which has no committed node yet), the editing box is the source of truth for the handle
      const nonEditingHandleHit = getPathTextOffsetHandleAtPoint(point, selectedNodes, viewport);
      const pathOffsetHandleHit = editingTextBox
        ? { hit: isPointOnPathTextHandle(point, editingTextBox, viewport), nodeId: selectEditingNodeId(state) }
        : { hit: Boolean(nonEditingHandleHit), nodeId: nonEditingHandleHit?.nodeId ?? null };
      const resizeHandleHit = getResizeHandleAtPoint(point, resizableSelectedNodes, viewport);
      const rotateHandleHit = getRotateHandleAtPoint(point, resizableSelectedNodes, viewport);

      switch (true) {
        case Boolean(lineEndpointHit) && selectedNode.type === NodeType.line:
          canvas.classList.add(POSITIONING_CURSOR_CLASS);
          canvas.style.cursor = '';
          hoverRef.current = lineEndpointHit!.nodeId;
          break;
        case pathOffsetHandleHit.hit:
          canvas.classList.add(POSITIONING_CURSOR_CLASS);
          canvas.style.cursor = '';
          hoverRef.current = pathOffsetHandleHit.nodeId;
          break;
        case Boolean(resizeHandleHit): {
          const getCursorUrl = activeTool === ToolName.scale ? getRotatedScaleCursorUrl : getRotatedResizeCursorUrl;

          canvas.classList.remove(POSITIONING_CURSOR_CLASS);
          canvas.style.cursor = getCursorUrl(getResizeCursorAngle(resizeHandleHit!.handle, resizeHandleHit!.rotation)) ?? '';
          hoverRef.current = null;
          break;
        }
        case Boolean(rotateHandleHit):
          canvas.classList.remove(POSITIONING_CURSOR_CLASS);
          canvas.style.cursor =
            getRotatedRotateCursorUrl(getRotateCursorAngle(point, rotateHandleHit!.bounds, rotateHandleHit!.rotation)) ?? '';
          hoverRef.current = null;
          break;
        default: {
          const hit = getNodeAtPoint(point, selectOrderedNodes(state), viewport);

          canvas.classList.remove(POSITIONING_CURSOR_CLASS);
          canvas.style.cursor = '';
          hoverRef.current = hit?.id ?? null;
        }
      }
    }
  };

  const handlePointerLeave = (canvas: HTMLCanvasElement): void => {
    canvas.classList.remove(POSITIONING_CURSOR_CLASS);
    canvas.style.cursor = '';
    hoverRef.current = null;
  };

  useEffect(() => {
    const canvas = canvasRef.current;

    if (canvas && (activeTool === ToolName.default || activeTool === ToolName.scale)) {
      const onPointerMove = (event: PointerEvent): void => handlePointerMove(canvas, event);
      const onPointerLeave = (): void => handlePointerLeave(canvas);

      canvas.addEventListener('pointermove', onPointerMove);
      canvas.addEventListener('pointerleave', onPointerLeave);

      return (): void => {
        canvas.removeEventListener('pointermove', onPointerMove);
        canvas.removeEventListener('pointerleave', onPointerLeave);
        canvas.classList.remove(POSITIONING_CURSOR_CLASS);
        canvas.style.cursor = '';
        hoverRef.current = null;
      };
    }
  }, [activeTool, canvasRef, hoverRef]);
};
