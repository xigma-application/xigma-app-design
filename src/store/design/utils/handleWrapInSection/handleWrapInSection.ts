// others
import { WRAP_IN_SECTION_PADDING } from '../../constants';

// types
import { NodeType } from 'types/design/enums';
import { TDesignState } from '../../types';

// utils
import { canWrapInSection } from './canWrapInSection';
import { finalizeGroupPlacement } from '../handleGroupNodes/finalizeGroupPlacement';
import { getActivePage } from '../getActivePage';
import { getDefaultSectionStyle } from 'utils/design/section/getDefaultSectionStyle';
import { getNextSectionName } from '../getNextSectionName';
import { getNodesBoundingBox } from '../getNodesBoundingBox';
import { isContainerNode } from '../nodeHierarchy/isContainerNode';

export const handleWrapInSection = (state: TDesignState, sectionId: string): void => {
  const page = getActivePage(state);
  const selectedNodes = page.selectedIds.map((id) => page.nodes[id]);

  if (canWrapInSection(selectedNodes, page.nodes)) {
    const { parentId } = selectedNodes[0];
    const parent = parentId ? page.nodes[parentId] : null;
    const containerOrder = parent && isContainerNode(parent) ? parent.childIds : page.rootOrder;
    const memberIds = containerOrder.filter((id) => page.selectedIds.includes(id));
    const bounds = getNodesBoundingBox(memberIds.map((id) => page.nodes[id]));

    page.nodes[sectionId] = {
      ...getDefaultSectionStyle(),
      childIds: memberIds,
      height: bounds.height + WRAP_IN_SECTION_PADDING * 2,
      id: sectionId,
      name: getNextSectionName(page.nodes),
      parentId,
      rotation: 0,
      type: NodeType.section,
      width: bounds.width + WRAP_IN_SECTION_PADDING * 2,
      x: bounds.x - WRAP_IN_SECTION_PADDING,
      y: bounds.y - WRAP_IN_SECTION_PADDING,
    };
    memberIds.forEach((id) => {
      page.nodes[id].parentId = sectionId;
    });
    finalizeGroupPlacement(page, parentId, sectionId, memberIds);
  }
};
