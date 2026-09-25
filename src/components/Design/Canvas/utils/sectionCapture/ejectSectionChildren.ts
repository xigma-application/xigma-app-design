// store
import { AppDispatch, store } from 'store';
import { moveNodes } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';

// types
import { NodeType } from 'types/design/enums';
import { TDraftRect } from 'types/canvas';

// utils
import { getSectionEjectIds } from './getSectionEjectIds';
import { getSectionSiblingIds } from './getSectionSiblingIds';

export const ejectSectionChildren = (dispatch: AppDispatch, sectionId: string, startBox: TDraftRect): void => {
  const { nodes, rootOrder } = selectActivePage(store.getState());
  const section = nodes[sectionId];

  if (section?.type === NodeType.section) {
    const ejectIds = getSectionEjectIds(section, startBox, nodes);

    if (ejectIds.length > 0) {
      const targetIndex = getSectionSiblingIds(section, nodes, rootOrder).indexOf(sectionId) + 1;

      dispatch(moveNodes({ nodeIds: ejectIds, targetIndex, targetParentId: section.parentId }));
    }
  }
};
