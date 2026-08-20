// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TPoint } from 'types/canvas';
import { TSelectionToolRefs } from 'types/design/selectionTool/types';
import { TVectorNode } from 'types/design/types';
import { TVectorHandleHit } from '../../../../../../utils/getVectorHandleAtPoint';

// utils
import { armVectorGroupDrag } from '../../armVectorGroupDrag';
import { isPartOfVectorMultiSelection } from '../../isPartOfVectorMultiSelection';
import { selectAndArmVectorHandleDrag } from './selectAndArmVectorHandleDrag';
import { toggleVectorHandleSelection } from '../../../toggleVectorHandleSelection';

export const armVectorHandleClick = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  canvasRefs: TCanvasRefs,
  selectionRefs: TSelectionToolRefs,
  node: TVectorNode,
  hit: TVectorHandleHit,
  point: TPoint,
): void => {
  const isHitHandleSelected = canvasRefs.selectedVectorHandlesRef.current.some(
    (handle) => handle.end === hit.end && handle.segmentId === hit.segmentId,
  );

  switch (true) {
    case event.shiftKey:
      canvasRefs.selectedVectorHandlesRef.current = toggleVectorHandleSelection(canvasRefs.selectedVectorHandlesRef.current, {
        end: hit.end,
        segmentId: hit.segmentId,
      });
      break;
    case isPartOfVectorMultiSelection(canvasRefs, isHitHandleSelected):
      armVectorGroupDrag(canvas, event, canvasRefs, selectionRefs, node, point, { end: hit.end, kind: 'handle', segmentId: hit.segmentId });
      break;
    default:
      selectAndArmVectorHandleDrag(canvas, event, canvasRefs, selectionRefs, node.id, hit);
  }
};
