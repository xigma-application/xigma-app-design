import { shallowEqual } from 'react-redux';
import { useEffect, useRef } from 'react';

// store
import { selectActivePage, selectSelectedIds, selectSelectedParentIds } from 'store/design/selectors';
import { useAppSelector } from 'store';

// utils
import { getSelectionAncestorIds } from './utils/getSelectionAncestorIds';

export const useExpandAncestorsOnSelect = (expandedIds: Set<string>, onExpandedIdsChange: (next: Set<string>) => void): void => {
  const { nodes } = useAppSelector(selectActivePage);
  const selectedIds = useAppSelector(selectSelectedIds);
  const selectedParentIds = useAppSelector(selectSelectedParentIds, shallowEqual);
  const latestRef = useRef({ expandedIds, nodes, onExpandedIdsChange });

  latestRef.current = { expandedIds, nodes, onExpandedIdsChange };

  useEffect(() => {
    const { expandedIds, nodes, onExpandedIdsChange } = latestRef.current;
    const ancestorIds = getSelectionAncestorIds(selectedIds, nodes);
    const nextIds = new Set([...expandedIds, ...ancestorIds]);

    if (nextIds.size > expandedIds.size) {
      onExpandedIdsChange(nextIds);
    }
  }, [selectedIds, selectedParentIds]);
};
