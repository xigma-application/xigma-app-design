// hooks
import { useExpandedIds } from './useExpandedIds';

// types
import { TToggleExpandOptions, TTreeItem, TTreeRow } from '../types';

// utils
import { handleToggleExpand } from '../utils/handleToggleExpand';
import { resolveExpandedIdsControl } from '../utils/resolveExpandedIdsControl';

export type TUseTreeExpansionResult<T extends TTreeItem> = {
  expandedIds: Set<string>;
  onToggleExpand: (row: TTreeRow<T>, options?: TToggleExpandOptions) => void;
};

export const useTreeExpansion = <T extends TTreeItem>(
  controlledExpandedIds: Set<string> | undefined,
  onExpandedIdsChange: ((next: Set<string>) => void) | undefined,
  getChildren: (item: T) => T[] | undefined,
): TUseTreeExpansionResult<T> => {
  const { expandedIds, setSubtreeExpanded, toggleExpanded } = useExpandedIds(
    resolveExpandedIdsControl(controlledExpandedIds, onExpandedIdsChange),
  );

  const onToggleExpand = (row: TTreeRow<T>, options?: TToggleExpandOptions): void =>
    handleToggleExpand({ expandedIds, getChildren, options, row, setSubtreeExpanded, toggleExpanded });

  return { expandedIds, onToggleExpand };
};
