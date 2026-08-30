import { useState } from 'react';

export type TUseLayersExpansionResult = {
  collapseAll: TFunc;
  expandedIds: Set<string>;
  hasExpanded: boolean;
  onExpandedIdsChange: (next: Set<string>) => void;
};

export const useLayersExpansion = (): TUseLayersExpansionResult => {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const collapseAll = (): void => setExpandedIds(new Set());

  return { collapseAll, expandedIds, hasExpanded: expandedIds.size > 0, onExpandedIdsChange: setExpandedIds };
};
