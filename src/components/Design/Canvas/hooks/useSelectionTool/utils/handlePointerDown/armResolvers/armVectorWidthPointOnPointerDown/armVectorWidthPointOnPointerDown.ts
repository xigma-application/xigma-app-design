// others
import { VECTOR_VERTEX_HIT_RADIUS_PX } from 'constant/canvas';

// store
import { selectVectorEditingNodeIds } from 'store/design/selectors';
import { store } from 'store';

// types
import { TArmContext } from '../../types';
import { ToolName } from 'types/design/enums';

// utils
import { armVectorWidthHandleGrab } from './armVectorWidthHandleGrab';
import { armVectorWidthPointCreate } from './armVectorWidthPointCreate';
import { armVectorWidthRegulatorShiftToggle } from './armVectorWidthRegulatorShiftToggle';
import { getEligibleVectorWidthNodes } from '../../../../../../utils/getEligibleVectorWidthNodes';
import { getVectorWidthPointHandleAtPoint } from '../../../../../../utils/getVectorWidthPointHandleAtPoint';

export const armVectorWidthPointOnPointerDown = ({
  activeTool,
  canvas,
  canvasRefs,
  event,
  point,
  setClassName,
  viewport,
}: TArmContext): true | undefined => {
  const state = store.getState();
  const vectorEditingNodeIds = selectVectorEditingNodeIds(state);

  if (activeTool === ToolName.variableWidth && vectorEditingNodeIds.length > 0) {
    const eligibleNodes = getEligibleVectorWidthNodes(vectorEditingNodeIds, state.design.nodes);
    const handleHit = getVectorWidthPointHandleAtPoint(point, eligibleNodes, VECTOR_VERTEX_HIT_RADIUS_PX / viewport.zoom);

    switch (true) {
      case armVectorWidthRegulatorShiftToggle(canvasRefs, event, handleHit):
      case armVectorWidthHandleGrab(canvas, canvasRefs, event, point, setClassName, state, handleHit):
      case armVectorWidthPointCreate(canvas, canvasRefs, event, point, setClassName, state, eligibleNodes, viewport):
        return true;
      default:
        canvasRefs.vectorEdit.selectedVectorWidthHandlesRef.current = [];
    }
  }
};
