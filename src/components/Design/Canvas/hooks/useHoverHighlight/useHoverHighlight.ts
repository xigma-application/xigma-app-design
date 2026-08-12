import { RefObject, useEffect } from 'react';

// store
import { selectActiveTool, selectOrderedNodes, selectSelectedNodes, selectViewport } from 'store/design/selectors';
import { store, useAppSelector } from 'store';

// styles
import styles from '../../canvas.module.scss';

// types
import { NodeType, ToolName } from 'types/design/enums';

// utils
import { getLineEndpointAtPoint } from '../../utils/getLineEndpointAtPoint';
import { getNodeAtPoint } from '../../utils/getNodeAtPoint';
import { getPointerPosition } from '../../utils/getPointerPosition';
import { screenToWorld } from '../../utils/screenToWorld';

const POSITIONING_CURSOR_CLASS = styles['Canvas__canvas-element--positioning'];

export const useHoverHighlight = (canvasRef: RefObject<HTMLCanvasElement | null>, hoverRef: RefObject<string | null>): void => {
  const activeTool = useAppSelector(selectActiveTool);

  const handlePointerMove = (canvas: HTMLCanvasElement, event: PointerEvent): void => {
    if (event.buttons === 0) {
      const state = store.getState();
      const viewport = selectViewport(state);
      const point = screenToWorld(getPointerPosition(canvas, event), viewport);
      const selectedNodes = selectSelectedNodes(state);
      const [selectedNode] = selectedNodes;
      const lineEndpointHit = getLineEndpointAtPoint(point, selectedNodes, viewport);

      if (lineEndpointHit && selectedNode.type === NodeType.line) {
        canvas.classList.add(POSITIONING_CURSOR_CLASS);
        hoverRef.current = lineEndpointHit.nodeId;
      } else {
        const hit = getNodeAtPoint(point, selectOrderedNodes(state), viewport);

        canvas.classList.remove(POSITIONING_CURSOR_CLASS);
        hoverRef.current = hit?.id ?? null;
      }
    }
  };

  const handlePointerLeave = (canvas: HTMLCanvasElement): void => {
    canvas.classList.remove(POSITIONING_CURSOR_CLASS);
    hoverRef.current = null;
  };

  useEffect(() => {
    const canvas = canvasRef.current;

    if (canvas && activeTool === ToolName.default) {
      const onPointerMove = (event: PointerEvent): void => handlePointerMove(canvas, event);
      const onPointerLeave = (): void => handlePointerLeave(canvas);

      canvas.addEventListener('pointermove', onPointerMove);
      canvas.addEventListener('pointerleave', onPointerLeave);

      return (): void => {
        canvas.removeEventListener('pointermove', onPointerMove);
        canvas.removeEventListener('pointerleave', onPointerLeave);
        canvas.classList.remove(POSITIONING_CURSOR_CLASS);
        hoverRef.current = null;
      };
    }
  }, [activeTool, canvasRef, hoverRef]);
};
