// store
import { addGuide, deleteGuide, updateGuide } from 'store/design/slice';
import { endHistoryGesture } from 'store/history/actions';
import { selectAreRulersVisible, selectNodes, selectRenderOrderedNodes, selectViewport } from 'store/design/selectors';
import { AppDispatch, store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TCanvasRefs } from 'types/design/canvas/types';
import { TGuideAxis } from 'types/design/guides/types';

// utils
import { getFrameAtWorldPoint } from '../../../../utils/getFrameAtWorldPoint';
import { getGutterAxis } from '../getGutterAxis';
import { getPointerPosition } from 'utils/math/pointer/getPointerPosition';
import { screenToWorld } from 'utils/transform/screenToWorld';

const axisOrigin = (axis: TGuideAxis, node: { x: number; y: number } | null): number => (node ? (axis === 'x' ? node.x : node.y) : 0);

export const handlePointerUp = (canvas: HTMLCanvasElement, event: PointerEvent, dispatch: AppDispatch, refs: TCanvasRefs): void => {
  const dragging = refs.guides.draggingGuideRef.current;

  if (dragging) {
    const state = store.getState();
    const pointer = getPointerPosition(canvas, event);
    const droppedInGutter = getGutterAxis(pointer, selectAreRulersVisible(state), refs.layout.leftPanelWidthRef.current) !== null;

    if (dragging.id === null) {
      if (!droppedInGutter) {
        const frame = getFrameAtWorldPoint(screenToWorld(pointer, selectViewport(state)), selectRenderOrderedNodes(state));

        dispatch(
          addGuide({
            axis: dragging.axis,
            frameId: frame?.id ?? null,
            position: dragging.position - axisOrigin(dragging.axis, frame),
          }),
        );
      }
    } else if (dragging.hasMoved) {
      if (droppedInGutter) {
        dispatch(deleteGuide({ frameId: dragging.frameId, id: dragging.id }));
      } else {
        const frame = dragging.frameId ? selectNodes(state)[dragging.frameId] : undefined;
        const origin = frame?.type === NodeType.frame ? axisOrigin(dragging.axis, frame) : 0;

        dispatch(updateGuide({ frameId: dragging.frameId, id: dragging.id, position: dragging.position - origin }));
      }
    }

    dispatch(endHistoryGesture());
    refs.guides.draggingGuideRef.current = null;
    canvas.releasePointerCapture(event.pointerId);
    event.stopImmediatePropagation();
  }
};
