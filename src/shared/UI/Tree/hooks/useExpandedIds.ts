import { useState } from 'react';

// types
import { TExpandedIdsControl } from '../types';

export type TUseExpandedIdsResult = {
  expandedIds: Set<string>;
  setSubtreeExpanded: (ids: string[], expanded: boolean) => void;
  toggleExpanded: TFunc<[string]>;
};

export const useExpandedIds = (control?: TExpandedIdsControl): TUseExpandedIdsResult => {
  const [internalExpandedIds, setInternalExpandedIds] = useState<Set<string>>(new Set());
  const expandedIds = control ? control.expandedIds : internalExpandedIds;

  const applyChange = (getNext: (previous: Set<string>) => Set<string>): void => {
    if (control) {
      control.onExpandedIdsChange(getNext(control.expandedIds));
    } else {
      setInternalExpandedIds(getNext);
    }
  };

  const toggleExpanded = (id: string): void => {
    applyChange((previous) => {
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
    applyChange((previous) => {
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
