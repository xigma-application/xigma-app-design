// others
import { translationNameSpace as parentNameSpace } from '../constants';

export const translationNameSpace = `${parentNameSpace}.panelHeader`;

export const BOOLEAN_OPERATION_ITEMS = [
  { icon: 'BooleanUnion', labelKey: `${translationNameSpace}.booleanUnion`, shortcutKey: 'booleanUnion' },
  { icon: 'BooleanSubtract', labelKey: `${translationNameSpace}.booleanSubtract`, shortcutKey: 'booleanSubtract' },
  { icon: 'BooleanIntersect', labelKey: `${translationNameSpace}.booleanIntersect`, shortcutKey: 'booleanIntersect' },
  { icon: 'BooleanExclude', labelKey: `${translationNameSpace}.booleanExclude`, shortcutKey: 'booleanExclude' },
  { icon: 'Flatten', labelKey: `${translationNameSpace}.flatten`, shortcutKey: 'flatten' },
] as const;
