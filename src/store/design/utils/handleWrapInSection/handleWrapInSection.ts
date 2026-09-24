// others
import { SECTION_FILL } from 'components/Design/Canvas/constants';
import { WRAP_IN_SECTION_PADDING } from '../../constants';

// types
import { NodeType } from 'types/design/enums';
import { TDesignState } from '../../types';

// utils
import { canWrapInSection } from './canWrapInSection';
import { getActivePage } from '../getActivePage';
import { getNextSectionName } from '../getNextSectionName';
import { handleGroupNodes } from '../handleGroupNodes/handleGroupNodes';

export const handleWrapInSection = (state: TDesignState, sectionId: string): void => {
  const page = getActivePage(state);

  if (canWrapInSection(page.selectedIds.map((id) => page.nodes[id]))) {
    const name = getNextSectionName(page.nodes);
    handleGroupNodes(state, sectionId);
    const group = page.nodes[sectionId];

    if (group?.type === NodeType.group) {
      page.nodes[sectionId] = {
        childIds: group.childIds,
        fill: SECTION_FILL,
        height: group.height + WRAP_IN_SECTION_PADDING * 2,
        id: sectionId,
        name,
        parentId: group.parentId,
        rotation: 0,
        type: NodeType.section,
        width: group.width + WRAP_IN_SECTION_PADDING * 2,
        x: group.x - WRAP_IN_SECTION_PADDING,
        y: group.y - WRAP_IN_SECTION_PADDING,
      };
      page.selectedIds = [sectionId];
    }
  }
};
