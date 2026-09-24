// others
import { PANEL_SECTIONS } from '../../Mixed/constants';

// store
import { selectAppearanceNodes } from 'store/design/selectors';
import { useAppSelector } from 'store';

// types
import { TPanelSection } from '../../Mixed/types';

// utils
import { getNodesPanelSections } from '../../Mixed/utils/getNodesPanelSections';

export const useGroupPanel = (): TPanelSection[] => getNodesPanelSections(useAppSelector(selectAppearanceNodes), PANEL_SECTIONS);
