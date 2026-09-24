// others
import { PANEL_HEADER_BUTTONS, PANEL_SECTIONS } from '../constants';

// store
import { selectSelectedNodes } from 'store/design/selectors';
import { useAppSelector } from 'store';

// types
import { TPanelHeaderButton, TPanelSection } from '../types';

// utils
import { getCommonPanelItems } from '../utils/getCommonPanelItems';
import { isPanelNodeType } from '../utils/isPanelNodeType';

export type TUseMixedPanelResult = {
  buttons: TPanelHeaderButton[];
  count: number;
  sections: TPanelSection[];
};

export const useMixedPanel = (): TUseMixedPanelResult => {
  const selectedNodes = useAppSelector(selectSelectedNodes);
  const types = [...new Set(selectedNodes.map((node) => node?.type))].filter(
    (type): type is keyof typeof PANEL_SECTIONS => type !== undefined && isPanelNodeType(type),
  );

  return {
    buttons: getCommonPanelItems(PANEL_HEADER_BUTTONS, types),
    count: selectedNodes.length,
    sections: getCommonPanelItems(PANEL_SECTIONS, types),
  };
};
