// others
import { MIRRORED_COLUMNS_ALIGN, MIRRORED_ROWS_ALIGN } from './constants';

// types
import { TFlipAxis } from './types';
import { TLayoutGuide } from 'types/design/types';

export const getMirroredLayoutGuides = (layoutGuides: TLayoutGuide[] | undefined, axis: TFlipAxis): TLayoutGuide[] | undefined =>
  layoutGuides?.map((guide) =>
    axis === 'horizontal'
      ? { ...guide, columnsAlign: guide.columnsAlign ? MIRRORED_COLUMNS_ALIGN[guide.columnsAlign] : undefined }
      : { ...guide, rowsAlign: guide.rowsAlign ? MIRRORED_ROWS_ALIGN[guide.rowsAlign] : undefined },
  );
