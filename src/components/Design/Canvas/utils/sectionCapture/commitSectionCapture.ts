// store
import { AppDispatch } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TDraftRect } from 'types/canvas';

// utils
import { captureSectionSiblings } from './captureSectionSiblings';
import { ejectSectionChildren } from './ejectSectionChildren';

export const commitSectionCapture = (
  dispatch: AppDispatch,
  canvasRefs: TCanvasRefs,
  sectionId: string,
  startBox: TDraftRect | null,
): void => {
  if (startBox) {
    ejectSectionChildren(dispatch, sectionId, startBox);
  }

  captureSectionSiblings(dispatch, sectionId);
  canvasRefs.transform.sectionCaptureIdsRef.current = [];
};
