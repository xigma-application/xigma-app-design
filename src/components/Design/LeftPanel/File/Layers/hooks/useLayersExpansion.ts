import { useEffect, useState } from 'react';

// store
import { selectNodes } from 'store/design/selectors';
import { useAppSelector } from 'store';

// utils
import { pruneExpandedIds } from './utils/pruneExpandedIds';

export type TUseLayersExpansionResult = {
  collapseAll: TFunc;
  expandedIds: Set<string>;
  hasExpanded: boolean;
  onExpandedIdsChange: (next: Set<string>) => void;
};

export const useLayersExpansion = (): TUseLayersExpansionResult => {
  const nodes = useAppSelector(selectNodes);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const collapseAll = (): void => setExpandedIds(new Set());

  useEffect(() => {
    setExpandedIds((current) => pruneExpandedIds(current, nodes));
  }, [nodes]);

  return { collapseAll, expandedIds, hasExpanded: expandedIds.size > 0, onExpandedIdsChange: setExpandedIds };
};
