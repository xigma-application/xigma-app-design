// types
import { RootState } from 'store';
import { TCanvasRefs } from 'types/design/canvas/types';
import { TPoint } from 'types/canvas';
import { TVectorWidthPointHandleHit } from '../../../../../../utils/getVectorWidthPointHandleAtPoint';

// utils
import { getRotatedCursorUrl } from 'utils/canvas/createCursorRotator/getRotatedCursorUrl';
import { getVectorWidthPointGroupDragTargets } from '../../../../../../utils/getVectorWidthPointGroupDragTargets';

export const armVectorWidthHandleGrab = (
  canvas: HTMLCanvasElement,
  canvasRefs: TCanvasRefs,
  event: PointerEvent,
  point: TPoint,
  setClassName: (className: string | null) => void,
  state: RootState,
  handleHit: TVectorWidthPointHandleHit | null,
): true | undefined => {
  if (handleHit) {
    const resizeSide = handleHit.target === 'point' ? null : handleHit.target;
    const groupDrag = resizeSide
      ? getVectorWidthPointGroupDragTargets(
          canvasRefs.vectorEdit.selectedVectorWidthHandlesRef.current,
          state.design.pages[state.design.activePageId].nodes,
          handleHit.nodeId,
          handleHit.point.id,
        )
      : null;

    canvasRefs.vectorWidth.vectorWidthPointDragRef.current = {
      armMagnitude: handleHit.target === 'left' ? handleHit.point.leftOffset : handleHit.point.rightOffset,
      armWorldPoint: point,
      groupTargets: groupDrag?.groupTargets ?? [],
      isNewPoint: false,
      nodeId: handleHit.nodeId,
      point: { ...handleHit.point },
      target: handleHit.target,
    };
    canvas.setPointerCapture(event.pointerId);

    if (groupDrag && resizeSide) {
      canvasRefs.vectorEdit.selectedVectorWidthHandlesRef.current = groupDrag.selection;
      canvasRefs.vectorEdit.lastVectorWidthHandleSideRef.current = {
        nodeId: handleHit.nodeId,
        pointId: handleHit.point.id,
        side: resizeSide,
      };
      canvas.style.cursor = getRotatedCursorUrl('resize', handleHit.angle) ?? '';
      setClassName(null);
    } else {
      const isAlreadySelected = canvasRefs.vectorEdit.selectedVectorWidthHandlesRef.current.some(
        (selected) => selected.side === 'point' && selected.nodeId === handleHit.nodeId && selected.pointId === handleHit.point.id,
      );

      if (!isAlreadySelected) {
        canvasRefs.vectorEdit.selectedVectorWidthHandlesRef.current = [
          { nodeId: handleHit.nodeId, pointId: handleHit.point.id, side: 'point' },
        ];
      }

      canvas.style.cursor = '';
      setClassName('controller');
    }

    return true;
  }
};
