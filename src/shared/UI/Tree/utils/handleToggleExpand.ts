// types
import { TToggleExpandOptions, TTreeItem, TTreeRow } from '../types';

// utils
import { collectExpandableIds } from './collectExpandableIds';

type THandleToggleExpandParams<T extends TTreeItem> = {
  expandedIds: Set<string>;
  getChildren: (item: T) => T[] | undefined;
  options: TToggleExpandOptions | undefined;
  row: TTreeRow<T>;
  setSubtreeExpanded: (ids: string[], expanded: boolean) => void;
  toggleExpanded: (id: string) => void;
};

export const handleToggleExpand = <T extends TTreeItem>({
  expandedIds,
  getChildren,
  options,
  row,
  setSubtreeExpanded,
  toggleExpanded,
}: THandleToggleExpandParams<T>): void => {
  if (options?.recursive) {
    setSubtreeExpanded(collectExpandableIds(row.item, getChildren), !expandedIds.has(row.item.id));
  } else {
    toggleExpanded(row.item.id);
  }
};
