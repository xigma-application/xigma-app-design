// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TVectorWidthPointHandleHit } from '../../../../../../utils/getVectorWidthPointHandleAtPoint';

// utils
import { toggleVectorWidthRegulatorSelection } from '../../../toggleVectorWidthRegulatorSelection';

export const armVectorWidthRegulatorShiftToggle = (
  canvasRefs: TCanvasRefs,
  event: PointerEvent,
  handleHit: TVectorWidthPointHandleHit | null,
): true | undefined => {
  if (handleHit && event.shiftKey) {
    canvasRefs.selectedVectorWidthHandlesRef.current = toggleVectorWidthRegulatorSelection(
      canvasRefs.selectedVectorWidthHandlesRef.current,
      handleHit.nodeId,
      handleHit.point.id,
    );

    return true;
  }
};
