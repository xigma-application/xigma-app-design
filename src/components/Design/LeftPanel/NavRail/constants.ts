// @xigma
import { TIconProps } from '@xigma/components';

// others
import { translationNameSpace as parentNameSpace } from '../constants';

// types
import { NavItemName } from './types';

export const translationNameSpace = `${parentNameSpace}.navRail`;

export const NAV_ITEM_ORDER: NavItemName[] = [
  NavItemName.file,
  NavItemName.agents,
  NavItemName.assets,
  NavItemName.tools,
  NavItemName.variables,
];

export const NAV_ITEM_ICON: Record<NavItemName, TIconProps['name']> = {
  [NavItemName.agents]: 'Agents',
  [NavItemName.assets]: 'Assets',
  [NavItemName.file]: 'File',
  [NavItemName.tools]: 'Tools',
  [NavItemName.variables]: 'Variables',
};

export const NAV_ITEM_LABEL: Record<NavItemName, string> = {
  [NavItemName.agents]: `${translationNameSpace}.item.agents`,
  [NavItemName.assets]: `${translationNameSpace}.item.assets`,
  [NavItemName.file]: `${translationNameSpace}.item.file`,
  [NavItemName.tools]: `${translationNameSpace}.item.tools`,
  [NavItemName.variables]: `${translationNameSpace}.item.variables`,
};
