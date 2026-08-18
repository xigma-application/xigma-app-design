import { RefObject, useEffect } from 'react';

// others
import { useClassNames } from '../../../core/ClassNamesProvider/hooks/useClassNames';

// store
import {
  selectActiveTool,
  selectEditingNodeId,
  selectEditingTextBox,
  selectEditingTextContent,
  selectOrderedNodes,
  selectSelectedNodes,
  selectViewport,
} from 'store/design/selectors';
import { store, useAppSelector } from 'store';

// types
import { NodeType, ToolName } from 'types/design/enums';

// utils
import { getCollidesWithEditingText } from './utils/getCollidesWithEditingText';
import { getCornerRadiusHandleAtPoint } from '../../utils/getCornerRadiusHandleAtPoint';
import { getEllipseArcHandleAtPoint } from '../../utils/getEllipseArcHandleAtPoint';
import { getEllipseArcRatioHandleAtPoint } from '../../utils/getEllipseArcRatioHandleAtPoint';
import { getEllipseArcRotateHandleAtPoint } from '../../utils/getEllipseArcRotateHandleAtPoint';
import { getLineEndpointAtPoint } from '../../utils/getLineEndpointAtPoint';
import { getNodeAtPoint } from '../../utils/getNodeAtPoint';
import { getPathOffsetHandleHit } from './utils/getPathOffsetHandleHit';
import { getPointerPosition } from '../../utils/getPointerPosition';
import { getPolygonCornerRadiusHandleHit } from './utils/getPolygonCornerRadiusHandleHit';
import { getPolygonVertexCountHandleAtPoint } from '../../utils/getPolygonVertexCountHandleAtPoint';
import { getResizeCursorAngle } from 'utils/math/getResizeCursorAngle';
import { getResizeHandleAtPoint } from '../../utils/getResizeHandleAtPoint';
import { getRotateCursorAngle } from 'utils/math/getRotateCursorAngle';
import { getRotateHandleAtPoint } from '../../utils/getRotateHandleAtPoint';
import { getRotatedResizeCursorUrl } from 'utils/canvas/getRotatedResizeCursorUrl';
import { getRotatedRotateCursorUrl } from 'utils/canvas/getRotatedRotateCursorUrl';
import { getRotatedScaleCursorUrl } from 'utils/canvas/getRotatedScaleCursorUrl';
import { getStarCornerRadiusHandleHit } from './utils/getStarCornerRadiusHandleHit';
import { getStarVertexCountHandleAtPoint } from '../../utils/getStarVertexCountHandleAtPoint';
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
      const pathOffsetHandleHit = getPathOffsetHandleHit(point, editingTextBox, selectEditingNodeId(state), selectedNodes, viewport);
      const resizeHandleHit = getResizeHandleAtPoint(point, resizableSelectedNodes, viewport);
      const polygonVertexCountHandleHit = getPolygonVertexCountHandleAtPoint(point, resizableSelectedNodes, viewport);
      const starVertexCountHandleHit = getStarVertexCountHandleAtPoint(point, resizableSelectedNodes, viewport);
      const ellipseArcHandleHit = getEllipseArcHandleAtPoint(point, resizableSelectedNodes, viewport);
      const ellipseArcRotateHandleHit = getEllipseArcRotateHandleAtPoint(point, resizableSelectedNodes, viewport);
      const ellipseArcRatioHandleHit = getEllipseArcRatioHandleAtPoint(point, resizableSelectedNodes, viewport);
      const cornerRadiusHandleHit = resizeHandleHit ? null : getCornerRadiusHandleAtPoint(point, resizableSelectedNodes, viewport);
      const polygonCornerRadiusHandleHit = getPolygonCornerRadiusHandleHit(point, resizeHandleHit, resizableSelectedNodes, viewport);
      const starCornerRadiusHandleHit = getStarCornerRadiusHandleHit(point, resizeHandleHit, resizableSelectedNodes, viewport);
      const rotateHandleHit = getRotateHandleAtPoint(point, resizableSelectedNodes, viewport);
      const collidesWithEditingText = getCollidesWithEditingText(editingTextBox, selectEditingTextContent(state), point, viewport.zoom);

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
        case collidesWithEditingText:
          setClassName(null);
          canvas.style.cursor = 'text';
          hoverRef.current = null;
          break;
        case Boolean(polygonVertexCountHandleHit):
          setClassName('vertices');
          canvas.style.cursor = '';
          hoverRef.current = polygonVertexCountHandleHit!.nodeId;
          break;
        case Boolean(starVertexCountHandleHit):
          setClassName('vertices');
          canvas.style.cursor = '';
          hoverRef.current = starVertexCountHandleHit!.nodeId;
          break;
        case Boolean(ellipseArcHandleHit):
          setClassName('radius');
          canvas.style.cursor = '';
          hoverRef.current = ellipseArcHandleHit!.nodeId;
          break;
        case Boolean(ellipseArcRotateHandleHit):
          setClassName('radius');
          canvas.style.cursor = '';
          hoverRef.current = ellipseArcRotateHandleHit!.nodeId;
          break;
        case Boolean(ellipseArcRatioHandleHit):
          setClassName('radius');
          canvas.style.cursor = '';
          hoverRef.current = ellipseArcRatioHandleHit!.nodeId;
          break;
        case Boolean(resizeHandleHit): {
          const getCursorUrl = activeTool === ToolName.scale ? getRotatedScaleCursorUrl : getRotatedResizeCursorUrl;

          setClassName(null);
          canvas.style.cursor = getCursorUrl(getResizeCursorAngle(resizeHandleHit!.handle, resizeHandleHit!.rotation)) ?? '';
          hoverRef.current = null;
          break;
        }
        case Boolean(cornerRadiusHandleHit):
          setClassName('radius');
          canvas.style.cursor = '';
          hoverRef.current = cornerRadiusHandleHit!.nodeId;
          break;
        case Boolean(polygonCornerRadiusHandleHit):
          setClassName('radius');
          canvas.style.cursor = '';
          hoverRef.current = polygonCornerRadiusHandleHit!.nodeId;
          break;
        case Boolean(starCornerRadiusHandleHit):
          setClassName('radius');
          canvas.style.cursor = '';
          hoverRef.current = starCornerRadiusHandleHit!.nodeId;
          break;
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
      canvas.addEventListener('pointerup', onPointerMove);
      canvas.addEventListener('pointerleave', onPointerLeave);

      return (): void => {
        canvas.removeEventListener('pointermove', onPointerMove);
        canvas.removeEventListener('pointerup', onPointerMove);
        canvas.removeEventListener('pointerleave', onPointerLeave);
        setClassName(null);
        canvas.style.cursor = '';
        hoverRef.current = null;
      };
    }
  }, [activeTool, canvasRef, hoverRef, setClassName]);
};
