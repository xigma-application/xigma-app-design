// components
import { TTab } from 'shared/UITools/Tabs/types';

// others
import { translationNameSpace as parentNameSpace } from '../constants';

export const translationNameSpace = `${parentNameSpace}.header`;

export const VIEW_MODE_TABS: TTab[] = [
  { labelTranslationKey: `${translationNameSpace}.tabDesign`, name: 'design' },
  { labelTranslationKey: `${translationNameSpace}.tabPrototype`, name: 'prototype' },
];
