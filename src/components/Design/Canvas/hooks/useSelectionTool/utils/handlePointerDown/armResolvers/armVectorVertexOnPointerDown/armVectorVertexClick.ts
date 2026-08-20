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

// resolves a pointerdown that hit a vertex into one of three outcomes: shift toggles it into/out of the
// multi-selection; a plain click on a vertex that's already part of a 2+ multi-selection keeps the whole
// selection and arms a group drag with a pending collapse (see disarmVectorMultiDrag.ts); anything else
// replaces the selection with just this vertex and arms its own single-vertex drag
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
      canvasRefs.selectedVectorVertexIdsRef.current = toggleSelection(canvasRefs.selectedVectorVertexIdsRef.current, hit.vertexId);
      break;
    case isPartOfVectorMultiSelection(canvasRefs, canvasRefs.selectedVectorVertexIdsRef.current.includes(hit.vertexId)):
      armVectorGroupDrag(canvas, event, canvasRefs, node, point, { id: hit.vertexId, kind: 'vertex' });
      break;
    default:
      selectAndArmVectorVertexDrag(canvas, event, canvasRefs, selectionRefs, node, hit.vertexId, point);
  }
};
