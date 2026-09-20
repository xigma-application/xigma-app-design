// types
import { LayoutGuideColumnsAlign } from 'types/design/enums';
import { TLayoutGuide } from 'types/design/types';

export const getLayoutGuideColumnsAlign = (guide: TLayoutGuide): LayoutGuideColumnsAlign =>
  guide.columnsAlign ?? LayoutGuideColumnsAlign.stretch;
