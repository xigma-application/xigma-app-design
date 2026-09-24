// @xigma
import { TIconProps } from '@xigma/components';

// types
import { BooleanOperation } from 'types/design/enums';

export const BOOLEAN_OPERATION_ICON: Record<BooleanOperation, TIconProps['name']> = {
  [BooleanOperation.exclude]: 'BooleanExclude',
  [BooleanOperation.intersect]: 'BooleanIntersect',
  [BooleanOperation.subtract]: 'BooleanSubtract',
  [BooleanOperation.union]: 'BooleanUnion',
};
