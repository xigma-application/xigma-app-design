// types
import { StrokeAlign } from 'types/design/enums';
import { TDropdownOption } from 'shared/UITools/Dropdown/types';

const STROKE_ALIGN_ORDER = [StrokeAlign.inside, StrokeAlign.center, StrokeAlign.outside];

export const getStrokeAlignOptions = (getLabel: (strokeAlign: StrokeAlign) => string): TDropdownOption<StrokeAlign>[] =>
  STROKE_ALIGN_ORDER.map((strokeAlign) => ({ label: getLabel(strokeAlign), value: strokeAlign }));
