// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TPoint } from 'types/canvas';
import { TSelectionToolRefs } from 'types/design/selectionTool/types';
import { TVectorNode } from 'types/design/types';

// utils
import { armVectorGroupDrag } from '../../armVectorGroupDrag';
import { isPartOfVectorMultiSelection } from '../../isPartOfVectorMultiSelection';
import { selectAndArmVectorVertexDrag } from './selectAndArmVectorVertexDrag';
import { toggleSelection } from '../../../toggleSelection';

export const armVectorVertexClick = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  canvasRefs: TCanvasRefs,
  selectionRefs: TSelectionToolRefs,
  node: TVectorNode,
  hit: { vertexId: string },
  point: TPoint,
): void => {
  switch (true) {
    case event.shiftKey:
      canvasRefs.vectorEdit.selectedVectorVertexIdsRef.current = toggleSelection(
        canvasRefs.vectorEdit.selectedVectorVertexIdsRef.current,
        hit.vertexId,
      );
      break;
    case isPartOfVectorMultiSelection(canvasRefs, canvasRefs.vectorEdit.selectedVectorVertexIdsRef.current.includes(hit.vertexId)):
      armVectorGroupDrag(canvas, event, canvasRefs, point, { id: hit.vertexId, kind: 'vertex' });
      break;
    default:
      selectAndArmVectorVertexDrag(canvas, event, canvasRefs, selectionRefs, node, hit.vertexId, point);
  }
};
