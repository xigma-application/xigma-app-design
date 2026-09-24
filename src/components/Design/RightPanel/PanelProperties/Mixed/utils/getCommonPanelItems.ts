// types
import { TPanelNodeType } from '../types';

export const getCommonPanelItems = <TItem extends string>(itemsByType: Record<TPanelNodeType, TItem[]>, types: TPanelNodeType[]): TItem[] =>
  types.reduce<TItem[]>((common, type) => common.filter((item) => itemsByType[type].includes(item)), itemsByType[types[0]] ?? []);
