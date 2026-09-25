// store
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TCanvasRefs } from 'types/design/canvas/types';

// utils
import { getSectionCaptureIds } from './getSectionCaptureIds';

export const updateSectionCaptureIds = (canvasRefs: TCanvasRefs, sectionId: string): void => {
  const { nodes, rootOrder } = selectActivePage(store.getState());
  const section = nodes[sectionId];

  canvasRefs.transform.sectionCaptureIdsRef.current =
    section?.type === NodeType.section ? getSectionCaptureIds(section, nodes, rootOrder) : [];
};
