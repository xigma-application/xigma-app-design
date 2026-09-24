// others
import { PANEL_SECTIONS } from '../constants';

// store
import { selectSelectedNodes } from 'store/design/selectors';
import { useAppSelector } from 'store';

// types
import { TPanelSection } from '../types';

// utils
import { getCommonPanelItems } from '../utils/getCommonPanelItems';
import { isPanelNodeType } from '../utils/isPanelNodeType';

export type TUseMixedPanelResult = {
  count: number;
  sections: TPanelSection[];
};

export const useMixedPanel = (): TUseMixedPanelResult => {
  const selectedNodes = useAppSelector(selectSelectedNodes);
  const types = [...new Set(selectedNodes.map((node) => node?.type))].filter(
    (type): type is keyof typeof PANEL_SECTIONS => type !== undefined && isPanelNodeType(type),
  );

  return {
    count: selectedNodes.length,
    sections: getCommonPanelItems(PANEL_SECTIONS, types),
  };
};
