// others
import { translationNameSpace as parentNameSpace } from '../constants';

// types
import { BooleanOperation } from 'types/design/enums';

export const translationNameSpace = `${parentNameSpace}.panelHeader`;

export const BOOLEAN_OPERATION_LABEL_KEY: Record<BooleanOperation, string> = {
  [BooleanOperation.exclude]: `${translationNameSpace}.booleanExclude`,
  [BooleanOperation.intersect]: `${translationNameSpace}.booleanIntersect`,
  [BooleanOperation.subtract]: `${translationNameSpace}.booleanSubtract`,
  [BooleanOperation.union]: `${translationNameSpace}.booleanUnion`,
};

export const BOOLEAN_OPERATION_ITEMS = [
  { operation: BooleanOperation.union, shortcutKey: 'booleanUnion' },
  { operation: BooleanOperation.subtract, shortcutKey: 'booleanSubtract' },
  { operation: BooleanOperation.intersect, shortcutKey: 'booleanIntersect' },
  { operation: BooleanOperation.exclude, shortcutKey: 'booleanExclude' },
] as const;

export const COMPONENT_NON_MATCHING_HINT_LABEL_KEY = 'design.toolbar.componentHint.nonMatching';
