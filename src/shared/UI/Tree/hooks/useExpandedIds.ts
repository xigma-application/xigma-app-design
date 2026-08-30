import { useState } from 'react';

export type TUseExpandedIdsResult = {
  expandedIds: Set<string>;
  setSubtreeExpanded: (ids: string[], expanded: boolean) => void;
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

  const setSubtreeExpanded = (ids: string[], expanded: boolean): void => {
    setExpandedIds((previous) => {
      const next = new Set(previous);

      ids.forEach((id) => {
        if (expanded) {
          next.add(id);
        } else {
          next.delete(id);
        }
      });

      return next;
    });
  };

  return { expandedIds, setSubtreeExpanded, toggleExpanded };
};
