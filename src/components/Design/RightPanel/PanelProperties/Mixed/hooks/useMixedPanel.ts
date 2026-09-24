// others
import { CHILD_PANEL_SECTIONS, PANEL_SECTIONS } from '../constants';

// store
import { selectAppearanceNodes, selectSelectedNodes } from 'store/design/selectors';
import { useAppSelector } from 'store';

// types
import { TPanelSection } from '../types';

// utils
import { getNodesPanelSections } from '../utils/getNodesPanelSections';

export type TUseMixedPanelResult = {
  count: number;
  sections: TPanelSection[];
};

export const useMixedPanel = (): TUseMixedPanelResult => {
  const selectedNodes = useAppSelector(selectSelectedNodes);
  const childSections = getNodesPanelSections(useAppSelector(selectAppearanceNodes), PANEL_SECTIONS);

  return {
    count: selectedNodes.length,
    sections: getNodesPanelSections(selectedNodes, PANEL_SECTIONS).filter(
      (section) => !CHILD_PANEL_SECTIONS.includes(section) || childSections.includes(section),
    ),
  };
};
