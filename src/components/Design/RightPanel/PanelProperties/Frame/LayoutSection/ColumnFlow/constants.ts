// others
import { translationNameSpace as parentNameSpace } from '../constants';

// types
import { LayoutMode } from 'types/design/enums';
import { TFlowOption } from './types';

export const translationNameSpace = `${parentNameSpace}.columnFlow`;

export const FLOW_OPTIONS: TFlowOption[] = [
  { icon: 'FlowDefault', labelKey: 'freeForm', value: LayoutMode.freeForm },
  { icon: 'FlowVertical', labelKey: 'vertical', value: LayoutMode.vertical },
  { icon: 'FlowHorizontal', labelKey: 'horizontal', value: LayoutMode.horizontal },
  { icon: 'FlowGrid', labelKey: 'grid', value: LayoutMode.grid },
];
