import { RefObject } from 'react';

// others
import { MIN_SHAPE_SIZE } from 'components/Design/Canvas/constants';

// store
import { addNode, setActiveTool } from 'store/design/slice';
import { endHistoryGesture } from 'store/history/actions';
import { AppDispatch, AppStore } from 'store';

// types
import { NodeType, ToolName } from 'types/design/enums';
import { TCanvasRefs } from 'types/design/canvas/types';
import { TLineEndpointStyle, TViewport } from 'types/design/types';
import { TPoint } from 'types/canvas';

// utils
import { getAngleSnappedVectorPoint } from 'utils/canvas/vectorNetwork/getAngleSnappedVectorPoint';
import { getPointerPosition } from 'utils/math/pointer/getPointerPosition';
import { screenToWorld } from 'utils/transform/screenToWorld';
import { selectLastCreatedNode } from 'components/Design/Canvas/utils/selectLastCreatedNode';

export const handlePointerUp = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  dispatch: AppDispatch,
  appStore: AppStore,
  canvasRefs: TCanvasRefs,
  viewport: TViewport,
  startRef: RefObject<TPoint | null>,
  endPoint: TLineEndpointStyle,
  startPoint: TLineEndpointStyle,
  stroke: string,
  name: string,
): void => {
  if (startRef.current) {
    const current = screenToWorld(getPointerPosition(canvas, event), viewport);
    const { point } = getAngleSnappedVectorPoint(startRef.current, current, viewport.zoom, event.shiftKey);
    const length = Math.hypot(point.x - startRef.current.x, point.y - startRef.current.y);

    if (length >= MIN_SHAPE_SIZE) {
      dispatch(
        addNode({
          endPoint,
          name,
          parentId: null,
          startPoint,
          stroke,
          type: NodeType.line,
          x1: Math.round(startRef.current.x),
          x2: Math.round(point.x),
          y1: Math.round(startRef.current.y),
          y2: Math.round(point.y),
        }),
      );
      selectLastCreatedNode(dispatch, appStore);
    }

    startRef.current = null;
    canvasRefs.draftRef.current = null;
    canvas.releasePointerCapture(event.pointerId);
    dispatch(setActiveTool(ToolName.default));
  }

  dispatch(endHistoryGesture());
};
