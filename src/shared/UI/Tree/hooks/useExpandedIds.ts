import { useState } from 'react';

export type TUseExpandedIdsResult = {
  expandedIds: Set<string>;
  toggleExpanded: TFunc<[string]>;
};

export const useExpandedIds = (): TUseExpandedIdsResult => {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggleExpanded = (id: string): void => {
    setExpandedIds((previous) => {
      const next = new Set(previous);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  };

  return { expandedIds, toggleExpanded };
};
