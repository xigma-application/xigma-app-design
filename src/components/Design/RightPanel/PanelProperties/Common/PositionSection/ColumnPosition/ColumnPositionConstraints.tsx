import { ReactNode } from 'react';

// components
import ConstraintsToggle from '../ColumnConstraints/ConstraintsToggle';

// types
import { AlignmentHorizontal, AlignmentVertical } from 'types/design/enums';

export const ColumnPositionConstraints = (
  noParent: boolean,
  showConstraints: boolean,
  horizontal: AlignmentHorizontal | undefined,
  vertical: AlignmentVertical | undefined,
  onToggle: TFunc,
): ReactNode[] | undefined => {
  if (noParent) {
    return undefined;
  }

  return [<ConstraintsToggle active={showConstraints} alignment={{ horizontal, vertical }} key="constraints-toggle" onToggle={onToggle} />];
};

export default ColumnPositionConstraints;
