// types
import { BooleanOperation } from 'types/design/enums';

export const isInsideBooleanResult = (operation: BooleanOperation, memberships: boolean[]): boolean => {
  switch (operation) {
    case BooleanOperation.subtract:
      return memberships[0] === true && !memberships.slice(1).some(Boolean);
    case BooleanOperation.intersect:
      return memberships.length > 0 && memberships.every(Boolean);
    case BooleanOperation.exclude:
      return memberships.filter(Boolean).length % 2 === 1;
    default:
      return memberships.some(Boolean);
  }
};
