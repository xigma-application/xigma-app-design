import { CSSProperties } from 'react';

// types
import { AlignmentLayout } from 'types/design/enums';

const CENTER_COLUMN_ALIGNMENTS = [AlignmentLayout.topCenter, AlignmentLayout.center, AlignmentLayout.bottomCenter];
const RIGHT_COLUMN_ALIGNMENTS = [AlignmentLayout.topRight, AlignmentLayout.right, AlignmentLayout.bottomRight];

export const getWrapRowJustifyContent = (alignment: AlignmentLayout): CSSProperties['justifyContent'] => {
  switch (true) {
    case CENTER_COLUMN_ALIGNMENTS.includes(alignment):
      return 'center';
    case RIGHT_COLUMN_ALIGNMENTS.includes(alignment):
      return 'flex-end';
    default:
      return 'flex-start';
  }
};
