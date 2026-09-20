// types
import { LayoutGuideRowsAlign } from 'types/design/enums';
import { TDropdownOption } from 'shared/UITools/Dropdown/types';

const LAYOUT_GUIDE_ROWS_ALIGN_ORDER = [
  LayoutGuideRowsAlign.top,
  LayoutGuideRowsAlign.bottom,
  LayoutGuideRowsAlign.center,
  LayoutGuideRowsAlign.stretch,
];

export const getLayoutGuideRowsAlignOptions = (
  getLabel: (align: LayoutGuideRowsAlign) => string,
): TDropdownOption<LayoutGuideRowsAlign>[] => LAYOUT_GUIDE_ROWS_ALIGN_ORDER.map((align) => ({ label: getLabel(align), value: align }));
