// types
import { LayoutGuideRowsAlign } from 'types/design/enums';
import { TLayoutGuide } from 'types/design/types';

export const getLayoutGuideRowsAlign = (guide: TLayoutGuide): LayoutGuideRowsAlign => guide.rowsAlign ?? LayoutGuideRowsAlign.stretch;
