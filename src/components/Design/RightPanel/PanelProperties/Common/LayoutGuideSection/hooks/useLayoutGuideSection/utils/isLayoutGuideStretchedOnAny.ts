// types
import { LayoutGuideColumnsAlign, LayoutGuideRowsAlign } from 'types/design/enums';
import { TLayoutGuide } from 'types/design/types';

// utils
import { getLayoutGuideColumnsAlign } from 'utils/design/layoutGuides/getLayoutGuideColumnsAlign';
import { getLayoutGuideRowsAlign } from 'utils/design/layoutGuides/getLayoutGuideRowsAlign';

export const isLayoutGuideStretchedOnAny = (guides: TLayoutGuide[]): boolean =>
  guides.some(
    (guide) =>
      getLayoutGuideColumnsAlign(guide) === LayoutGuideColumnsAlign.stretch ||
      getLayoutGuideRowsAlign(guide) === LayoutGuideRowsAlign.stretch,
  );
