// others
import { CHILD_PANEL_SECTIONS, PANEL_SECTIONS } from '../constants';

// store
import { selectAppearanceNodes, selectSelectedNodes } from 'store/design/selectors';
import { useAppSelector } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TPanelSection } from '../types';

// utils
import { getNodesPanelSections } from '../utils/getNodesPanelSections';

export type TUseMixedPanelResult = {
  count: number;
  hasSection: boolean;
  sections: TPanelSection[];
  withResizeToFit: boolean;
};

export const useMixedPanel = (): TUseMixedPanelResult => {
  const selectedNodes = useAppSelector(selectSelectedNodes);
  const childSections = getNodesPanelSections(useAppSelector(selectAppearanceNodes), PANEL_SECTIONS);

  return {
    count: selectedNodes.length,
    hasSection: selectedNodes.some((node) => node?.type === NodeType.section),
    sections: getNodesPanelSections(selectedNodes, PANEL_SECTIONS).filter(
      (section) => !CHILD_PANEL_SECTIONS.includes(section) || childSections.includes(section),
    ),
    withResizeToFit: selectedNodes.some(
      (node) => node?.type === NodeType.section || (node?.type === NodeType.frame && node.childIds.length > 0),
    ),
  };
};
