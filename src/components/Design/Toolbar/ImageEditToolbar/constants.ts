// @xigma
import { TIconProps } from '@xigma/components';

// others
import { translationNameSpace as toolbarNamespace } from '../constants';

export const translationNameSpace = `${toolbarNamespace}.imageEditToolbar`;

export const ICON_SIZE = 24;

export const SELECT_AREA_SHORTCUT = 'Q';

export type TImageEditMoreTool = {
  icon: TIconProps['name'];
  labelKey: string;
};

export const MORE_TOOLS: TImageEditMoreTool[] = [
  { icon: 'AiExpand', labelKey: `${translationNameSpace}.expand` },
  { icon: 'AiBoostResolution', labelKey: `${translationNameSpace}.boostResolution` },
  { icon: 'AiVectorize', labelKey: `${translationNameSpace}.vectorize` },
];
