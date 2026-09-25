// store
import { AppDispatch, store } from 'store';
import { moveNodes } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';

// types
import { NodeType } from 'types/design/enums';

// utils
import { getSectionCaptureIds } from './getSectionCaptureIds';

export const captureSectionSiblings = (dispatch: AppDispatch, sectionId: string): void => {
  const { nodes, rootOrder } = selectActivePage(store.getState());
  const section = nodes[sectionId];

  if (section?.type === NodeType.section) {
    const captureIds = getSectionCaptureIds(section, nodes, rootOrder);

    if (captureIds.length > 0) {
      dispatch(moveNodes({ nodeIds: captureIds, targetIndex: section.childIds.length, targetParentId: sectionId }));
    }
  }
};
