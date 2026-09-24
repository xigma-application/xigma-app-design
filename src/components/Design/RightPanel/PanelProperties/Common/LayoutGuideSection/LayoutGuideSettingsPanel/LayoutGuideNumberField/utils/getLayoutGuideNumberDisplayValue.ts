// others
import { MIXED_LABEL } from 'components/Design/RightPanel/PanelProperties/Common/constants';

export const getLayoutGuideNumberDisplayValue = (disabled: boolean, isMixed: boolean, value: number, unit: string): string => {
  if (disabled) {
    return '';
  }

  return isMixed ? MIXED_LABEL : `${value}${unit}`;
};
