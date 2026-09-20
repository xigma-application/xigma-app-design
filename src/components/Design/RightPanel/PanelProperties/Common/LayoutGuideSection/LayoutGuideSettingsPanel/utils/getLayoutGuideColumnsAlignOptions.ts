// types
import { LayoutGuideColumnsAlign } from 'types/design/enums';
import { TDropdownOption } from 'shared/UITools/Dropdown/types';

const LAYOUT_GUIDE_COLUMNS_ALIGN_ORDER = [
  LayoutGuideColumnsAlign.left,
  LayoutGuideColumnsAlign.right,
  LayoutGuideColumnsAlign.center,
  LayoutGuideColumnsAlign.stretch,
];

export const getLayoutGuideColumnsAlignOptions = (
  getLabel: (align: LayoutGuideColumnsAlign) => string,
): TDropdownOption<LayoutGuideColumnsAlign>[] =>
  LAYOUT_GUIDE_COLUMNS_ALIGN_ORDER.map((align) => ({ label: getLabel(align), value: align }));
