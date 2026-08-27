import { RefObject } from 'react';

// others
import { ERASER_DIAMETER_STEP_PX, ERASER_MAX_DIAMETER_PX, ERASER_MIN_DIAMETER_PX } from 'constant/canvas';

// types
import { KeyboardKeys } from 'types/enums';
import { ToolName } from 'types/design/enums';

export const adjustEraserDiameter = (event: KeyboardEvent, activeTool: ToolName, eraserDiameterRef: RefObject<number>): void => {
  if (activeTool === ToolName.erase) {
    if (event.code === KeyboardKeys.bracketLeft) {
      eraserDiameterRef.current = Math.max(ERASER_MIN_DIAMETER_PX, eraserDiameterRef.current - ERASER_DIAMETER_STEP_PX);
    }

    if (event.code === KeyboardKeys.bracketRight) {
      eraserDiameterRef.current = Math.min(ERASER_MAX_DIAMETER_PX, eraserDiameterRef.current + ERASER_DIAMETER_STEP_PX);
    }
  }
};
