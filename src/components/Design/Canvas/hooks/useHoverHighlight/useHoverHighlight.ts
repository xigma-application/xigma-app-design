import { RefObject, useEffect } from 'react';

// others
import { useClassNames } from '../../../core/ClassNamesProvider/hooks/useClassNames';

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

export const useHoverHighlight = (canvasRef: RefObject<HTMLCanvasElement | null>, hoverRef: RefObject<string | null>): void => {
  const activeTool = useAppSelector(selectActiveTool);
  const { setClassName } = useClassNames();

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
      const nonEditingHandleHit = getPathTextOffsetHandleAtPoint(point, selectedNodes, viewport);
      const pathOffsetHandleHit = editingTextBox
        ? { hit: isPointOnPathTextHandle(point, editingTextBox, viewport), nodeId: selectEditingNodeId(state) }
        : { hit: Boolean(nonEditingHandleHit), nodeId: nonEditingHandleHit?.nodeId ?? null };
      const resizeHandleHit = getResizeHandleAtPoint(point, resizableSelectedNodes, viewport);
      const rotateHandleHit = getRotateHandleAtPoint(point, resizableSelectedNodes, viewport);

      switch (true) {
        case Boolean(lineEndpointHit) && selectedNode.type === NodeType.line:
          setClassName('positioning');
          canvas.style.cursor = '';
          hoverRef.current = lineEndpointHit!.nodeId;
          break;
        case pathOffsetHandleHit.hit:
          setClassName('hand');
          canvas.style.cursor = '';
          hoverRef.current = pathOffsetHandleHit.nodeId;
          break;
        case Boolean(resizeHandleHit): {
          const getCursorUrl = activeTool === ToolName.scale ? getRotatedScaleCursorUrl : getRotatedResizeCursorUrl;

          setClassName(null);
          canvas.style.cursor = getCursorUrl(getResizeCursorAngle(resizeHandleHit!.handle, resizeHandleHit!.rotation)) ?? '';
          hoverRef.current = null;
          break;
        }
        case Boolean(rotateHandleHit):
          setClassName(null);
          canvas.style.cursor =
            getRotatedRotateCursorUrl(getRotateCursorAngle(point, rotateHandleHit!.bounds, rotateHandleHit!.rotation)) ?? '';
          hoverRef.current = null;
          break;
        default: {
          const hit = getNodeAtPoint(point, selectOrderedNodes(state), viewport);

          setClassName(null);
          canvas.style.cursor = '';
          hoverRef.current = hit?.id ?? null;
        }
      }
    }
  };

  const handlePointerLeave = (canvas: HTMLCanvasElement): void => {
    setClassName(null);
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
        setClassName(null);
        canvas.style.cursor = '';
        hoverRef.current = null;
      };
    }
  }, [activeTool, canvasRef, hoverRef, setClassName]);
};
