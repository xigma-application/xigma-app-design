// types
import { TTreeItem, TTreeRow } from '../types';

const visitTreeRow = <T extends TTreeItem>(
  item: T,
  depth: number,
  parentItem: T | null,
  getChildren: (item: T) => T[] | undefined,
  expandedIds: Set<string>,
  rows: TTreeRow<T>[],
): void => {
  const children = getChildren(item);
  const canHaveChildren = Array.isArray(children);
  const hasChildren = Boolean(children && children.length > 0);
  const isExpanded = hasChildren && expandedIds.has(item.id);

  rows.push({ canHaveChildren, depth, hasChildren, isExpanded, item, parentItem });

  if (isExpanded && children) {
    children.forEach((child) => visitTreeRow(child, depth + 1, item, getChildren, expandedIds, rows));
  }
};

export const flattenTreeRows = <T extends TTreeItem>(
  roots: T[],
  getChildren: (item: T) => T[] | undefined,
  expandedIds: Set<string>,
): TTreeRow<T>[] => {
  const rows: TTreeRow<T>[] = [];

  roots.forEach((item) => visitTreeRow(item, 0, null, getChildren, expandedIds, rows));

  return rows;
};
