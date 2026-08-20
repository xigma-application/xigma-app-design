// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TPoint } from 'types/canvas';
import { TVectorNode } from 'types/design/types';

// utils
import { armVectorGroupDrag } from '../../armVectorGroupDrag';
import { isPartOfVectorMultiSelection } from '../../isPartOfVectorMultiSelection';
import { selectAndArmVectorSegmentDrag } from './selectAndArmVectorSegmentDrag';
import { toggleSelection } from '../../../toggleSelection';

export const armVectorSegmentClick = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  canvasRefs: TCanvasRefs,
  node: TVectorNode,
  segmentId: string,
  canSplit: boolean,
  point: TPoint,
): void => {
  switch (true) {
    case event.shiftKey:
      canvasRefs.selectedVectorSegmentIdsRef.current = toggleSelection(canvasRefs.selectedVectorSegmentIdsRef.current, segmentId);
      break;
    case isPartOfVectorMultiSelection(canvasRefs, canvasRefs.selectedVectorSegmentIdsRef.current.includes(segmentId)):
      armVectorGroupDrag(canvas, event, canvasRefs, node, point, { id: segmentId, kind: 'segment' });
      break;
    default:
      selectAndArmVectorSegmentDrag(canvas, event, canvasRefs, node, segmentId, canSplit, point);
  }
};
