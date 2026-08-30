// types
import { TTreeItem } from '../types';

export const collectExpandableIds = <T extends TTreeItem>(item: T, getChildren: (item: T) => T[] | undefined): string[] => {
  const children = getChildren(item);

  if (children && children.length > 0) {
    return [item.id, ...children.flatMap((child) => collectExpandableIds(child, getChildren))];
  }

  return [];
};
