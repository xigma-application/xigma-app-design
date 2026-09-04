// others
import { translationNameSpace as parentNameSpace } from '../constants';

// types
import { TFlowOption } from './types';

export const translationNameSpace = `${parentNameSpace}.columnFlow`;

export const FLOW_OPTIONS: TFlowOption[] = [
  { icon: 'FlowDefault', labelKey: 'freeForm', value: 'freeForm' },
  { icon: 'FlowVertical', labelKey: 'vertical', value: 'vertical' },
  { icon: 'FlowHorizontal', labelKey: 'horizontal', value: 'horizontal' },
  { icon: 'FlowGrid', labelKey: 'grid', value: 'grid' },
];
